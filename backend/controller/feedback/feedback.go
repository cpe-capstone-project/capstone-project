package feedback

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Input struct สำหรับรับ JSON จาก frontend
type CreateFeedbackInput struct {
	FeedbackTitle   string `json:"FeedbackTitle" binding:"required"`
	FeedbackContent string `json:"FeedbackContent" binding:"required"`
	PsychologistID  uint   `json:"PsychologistID" binding:"required"`
	PatientID       uint   `json:"PatientID" binding:"required"`
	FeedbackTypeID  uint   `json:"FeedbackTypeID" binding:"required"`
	FeedbackTimeID  uint   `json:"FeedbackTimeID" binding:"required"`
	ThoughtRecordID *uint  `json:"ThoughtRecordID"` // optional
	DiaryIDs        []uint `json:"DiaryIDs"`        // หลาย Diary
}

func CreateFeedback(c *gin.Context) {
	var input CreateFeedbackInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// ตรวจสอบ ThoughtRecord uniqueness
	if input.ThoughtRecordID != nil {
		var count int64
		db.Model(&entity.Feedback{}).
			Where("thought_record_id = ?", *input.ThoughtRecordID).
			Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ThoughtRecord นี้มี Feedback แล้ว"})
			return
		}
	}

	now := time.Now()
	var startDate, endDate time.Time
	endDate = now // กำหนด endDate เป็นเวลาปัจจุบัน

	switch input.FeedbackTimeID {
	case 2: // Daily Summary
		startDate = now.Add(-24 * time.Hour) // 24 ชั่วโมงย้อนหลัง
	case 3: // Weekly Summary
		startDate = now.AddDate(0, 0, -7) // 7 วันย้อนหลัง
	case 4: // Monthly Summary
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location()) // วันแรกของเดือน
	default: // Diary Summary หรืออื่น ๆ
		startDate = now
	}

	// สร้าง Feedback
	feedback := entity.Feedback{
		FeedbackTitle:     input.FeedbackTitle,
		FeedbackContent:   input.FeedbackContent,
		PsychologistID:    input.PsychologistID,
		PatientID:         input.PatientID,
		FeedbackTypeID:    input.FeedbackTypeID,
		FeedbackTimeID:    input.FeedbackTimeID,
		FeedbackStartDate: startDate,
		FeedbackEndDate:   endDate,
	}

	if input.ThoughtRecordID != nil {
		feedback.ThoughtRecordID = *input.ThoughtRecordID
	}

	// เชื่อม Diary ผ่าน FeedbackDiary
	for _, diaryID := range input.DiaryIDs {
		feedback.FeedbackDiary = append(feedback.FeedbackDiary, entity.FeedbackDiary{
			DiaryID: diaryID,
		})
	}

	if err := db.Create(&feedback).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// preload ความสัมพันธ์ทั้งหมด
	db.Preload("Psychologist").
		Preload("Patient").
		Preload("FeedbackType").
		Preload("FeedbackTime").
		Preload("ThoughtRecord").
		Preload("FeedbackDiary.Diary").
		First(&feedback, feedback.ID)

	c.JSON(http.StatusCreated, feedback)
}

func GetFeedbackTime(c *gin.Context) {
	db := config.DB()
	var feedbackTimes []entity.FeedbackTime

	// ดึงข้อมูลทั้งหมด
	if err := db.Find(&feedbackTimes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ถ้าไม่มีข้อมูล
	if len(feedbackTimes) == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}

	c.JSON(http.StatusOK, feedbackTimes)
}
