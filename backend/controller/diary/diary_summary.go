package diary

import (
	"net/http"
	"strings"
	"time"
	"fmt"

	"capstone-project/config"
	"capstone-project/entity"
	"capstone-project/ai"

	"github.com/gin-gonic/gin"
)

type SummaryRequest struct {
	TherapyCaseID uint
	StartDate     string
	EndDate       string
	Timeframe     string
}

func GenerateDiarySummary(c *gin.Context) {
	var req SummaryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	var diaries []entity.Diaries
	db := config.DB()

	if req.StartDate == "" || req.EndDate == "" {
		// ไม่ใส่เวลา → ดึงทั้งหมดที่ TherapyCaseID ตรง
		if err := db.Where("therapy_case_id = ?", req.TherapyCaseID).Find(&diaries).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// ใส่เวลามา → ดึงตามช่วงเวลาที่ระบุ
		start, err1 := time.Parse("2006-01-02", req.StartDate)
		end, err2 := time.Parse("2006-01-02", req.EndDate)
		if err1 != nil || err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}

		if err := db.Where("therapy_case_id = ? AND created_at BETWEEN ? AND ?", req.TherapyCaseID, start, end).
			Find(&diaries).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if len(diaries) == 0 {
		c.JSON(http.StatusOK, gin.H{"summary": "ไม่พบไดอารี่ในช่วงเวลานี้"})
		return
	}

	// รวมเนื้อหา
	var contents []string
	for _, d := range diaries {
		contents = append(contents, d.Content)
	}
	combined := strings.Join(contents, "\n")

	// สร้าง prompt ช่วงเวลา
	timeframeText := "ทั้งหมด"
	if req.StartDate != "" && req.EndDate != "" {
		timeframeText = fmt.Sprintf("ช่วงวันที่ %s ถึง %s", req.StartDate, req.EndDate)
	}

	// เรียก AI เพื่อสรุป
	summaryText, err := ai.GenerateSummaryLocal(combined, timeframeText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI summary failed: " + err.Error()})
		return
	}

	// บันทึกสรุปลงฐานข้อมูล (ถ้าต้องการ)
	summary := entity.DiarySummary{
		TherapyCaseID: req.TherapyCaseID,
		Timeframe:     req.Timeframe,
		StartDate:     time.Time{}, // เก็บเฉพาะถ้ามี
		EndDate:       time.Time{},
		SummaryText:   summaryText,
	}

	if req.StartDate != "" && req.EndDate != "" {
		start, _ := time.Parse("2006-01-02", req.StartDate)
		end, _ := time.Parse("2006-01-02", req.EndDate)
		summary.StartDate = start
		summary.EndDate = end
	}

	if err := db.Create(&summary).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Save failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}
