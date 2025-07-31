package diary

import (
	"capstone-project/ai" // ✅ import module ai
	"capstone-project/config"
	"capstone-project/entity"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
)

type SummaryRequest struct {
	TherapyCaseID uint
	Timeframe     string
	StartDate     time.Time
	EndDate       time.Time
}

func stripHTMLTags(input string) string {
	re := regexp.MustCompile(`<[^>]*>`)
	return re.ReplaceAllString(input, "")
}

// GET /diary-summary/:id
func GetDiarySummaryByID(c *gin.Context) {
	ID := c.Param("id")
	var diary_summary entity.DiarySummary

	db := config.DB()
	results := db.Preload("TherapyCase").Preload("Diaries").First(&diary_summary, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if diary_summary.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diary_summary)
}

// POST /diary-summary
func SummarizeDiaries(c *gin.Context) {
	var req SummaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	db := config.DB()
	var diaries []entity.Diaries

	if err := db.Where("therapy_case_id = ? AND confirmed = ? AND created_at BETWEEN ? AND ?", req.TherapyCaseID, true, req.StartDate, req.EndDate).
		Order("created_at ASC").Find(&diaries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query diaries"})
		return

	}

	if len(diaries) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No diaries in selected timeframe"})
		return
	}

	// รวมไดอารี่เป็นข้อความเดียว
	fullText := ""
	for _, d := range diaries {
		cleanContent := stripHTMLTags(d.Content)
		fullText += "Title: " + d.Title + "\n" + "Content: " + cleanContent + "\n\n"
	}

	fmt.Println("Full diary text for summarization:", fullText)

	// เตรียมข้อความ prompt เพื่อสรุปด้วย Gemini
	summaryInput := fmt.Sprintf(`ด้านล่างคือบันทึกประจำวันของผู้ป่วยในการบำบัดด้วย CBT
	กรุณาสรุปเนื้อหาด้านล่างนี้เป็นภาษาไทยอย่างสั้น กระชับ และชัดเจน โดยต้องแสดง:
	1. สรุป: สรุปเนื้อหาไดอารี่ในรูปแบบที่เข้าใจง่าย
	2. Keyword: แสดงคำสำคัญที่สะท้อนอารมณ์หรือประเด็นหลักที่ปรากฏในไดอารี่ (คั่นด้วยเครื่องหมายจุลภาค)

	กรุณาแสดงผลลัพธ์ในรูปแบบดังนี้:
	สรุป: [ข้อความสรุป]  
	Keyword: [คำสำคัญ, คำสำคัญ, ...]

	ข้อมูลไดอารี่:
	%s`, fullText)

	// ⛔ ยกเลิกการแปล + summarize แบบเก่า
	// ✅ เรียก Gemini API ตรง ๆ แทน
	summaryTH, err := ai.SummarizeWithGemini(summaryInput)
	if err != nil {
		log.Println("Summarization with Gemini failed:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Summarization failed"})
		return
	}

	summaryText := ""
	keywords := ""

	summaryPattern := regexp.MustCompile(`(?m)^สรุป:\s*(.+)`)
	keywordPattern := regexp.MustCompile(`(?m)^Keyword:\s*(.+)`)

	if match := summaryPattern.FindStringSubmatch(summaryTH); len(match) > 1 {
		summaryText = match[1]
	}
	if match := keywordPattern.FindStringSubmatch(summaryTH); len(match) > 1 {
		keywords = match[1]
	}

	summary := entity.DiarySummary{
		TherapyCaseID: req.TherapyCaseID,
		Timeframe:     req.Timeframe,
		StartDate:     req.StartDate,
		EndDate:       req.EndDate,
		SummaryText:   summaryText,
		Keyword:       keywords,
		Diaries:       diaries,
	}

	if err := db.Create(&summary).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save summary"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"summary": summary})
}
