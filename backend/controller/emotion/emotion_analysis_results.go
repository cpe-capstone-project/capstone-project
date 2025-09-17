package emotion

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"time"
	
	"github.com/gin-gonic/gin"

)

// POST /emotion-analysis
func CreateEmotionAnalysis(c *gin.Context) {
	var emotionAnalysis entity.EmotionAnalysisResults

	// Bind JSON input to struct
	if err := c.ShouldBindJSON(&emotionAnalysis); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set analysis timestamp
	emotionAnalysis.AnalysisTimestamp = time.Now()

	db := config.DB()

	// Validate foreign keys exist
	if emotionAnalysis.DiaryID != 0 {
		var diary entity.Diaries
		if err := db.First(&diary, emotionAnalysis.DiaryID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Diary not found"})
			return
		}
	}

	if emotionAnalysis.ThoughtRecordID != 0 {
		var thoughtRecord entity.ThoughtRecord
		if err := db.First(&thoughtRecord, emotionAnalysis.ThoughtRecordID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ThoughtRecord not found"})
			return
		}
	}

	// Create record
	if err := db.Create(&emotionAnalysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, emotionAnalysis)
}

// GET /emotion-analysis
func GetAllEmotionAnalysis(c *gin.Context) {
	var emotionAnalyses []entity.EmotionAnalysisResults

	db := config.DB()
	results := db.Preload("Diary").Preload("ThoughtRecord").Preload("Emotions").Find(&emotionAnalyses)
	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, emotionAnalyses)
}

// GET /emotion-analysis/:id
func GetEmotionAnalysisByID(c *gin.Context) {
	ID := c.Param("id")
	var emotionAnalysis entity.EmotionAnalysisResults

	db := config.DB()
	results := db.Preload("Diary").Preload("ThoughtRecord").Preload("Emotions").First(&emotionAnalysis, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if emotionAnalysis.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{"error": "EmotionAnalysis not found"})
		return
	}
	c.JSON(http.StatusOK, emotionAnalysis)
}

// PATCH /emotion-analysis/:id
func UpdateEmotionAnalysis(c *gin.Context) {
	ID := c.Param("id")
	var emotionAnalysis entity.EmotionAnalysisResults

	db := config.DB()
	
	// Check if record exists
	if err := db.First(&emotionAnalysis, ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EmotionAnalysis not found"})
		return
	}

	// Bind updated data
	if err := c.ShouldBindJSON(&emotionAnalysis); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate foreign keys if they are being updated
	if emotionAnalysis.DiaryID != 0 {
		var diary entity.Diaries
		if err := db.First(&diary, emotionAnalysis.DiaryID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Diary not found"})
			return
		}
	}

	if emotionAnalysis.ThoughtRecordID != 0 {
		var thoughtRecord entity.ThoughtRecord
		if err := db.First(&thoughtRecord, emotionAnalysis.ThoughtRecordID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ThoughtRecord not found"})
			return
		}
	}

	// Update record
	if err := db.Save(&emotionAnalysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, emotionAnalysis)
}

// DELETE /emotion-analysis/:id
func DeleteEmotionAnalysis(c *gin.Context) {
	ID := c.Param("id")
	var emotionAnalysis entity.EmotionAnalysisResults

	db := config.DB()
	
	// Check if record exists
	if err := db.First(&emotionAnalysis, ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EmotionAnalysis not found"})
		return
	}

	// Delete record (soft delete because of gorm.Model)
	if err := db.Delete(&emotionAnalysis).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "EmotionAnalysis deleted successfully"})
}

// GET /patients/:id/latest-emotion - ดึงอารมณ์ล่าสุดของผู้ป่วย
func GetPatientLatestEmotion(c *gin.Context) {
	patientID := c.Param("id")
	var emotionAnalysis entity.EmotionAnalysisResults

	db := config.DB()

	// ดึง emotion analysis ล่าสุดของผู้ป่วย
	results := db.
		Where("patient_id = ?", patientID).
		Where("primary_emotion != '' AND primary_emotion IS NOT NULL").
		Order("created_at DESC").
		First(&emotionAnalysis)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis found for this patient"})
		return
	}

	if emotionAnalysis.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis found for this patient"})
		return
	}

	// ดึงข้อมูล emotion จาก primary_emotion
	var emotion entity.Emotions
	emotionResult := db.Where("emotionsname = ?", emotionAnalysis.PrimaryEmotion).First(&emotion)
	if emotionResult.Error != nil {
		// ถ้าไม่เจอใน DB ให้ส่งข้อมูลเฉพาะที่มี
		response := gin.H{
			"patient_id": patientID,
			"latest_emotion": gin.H{
				"analysis_id":        emotionAnalysis.ID,
				"primary_emotion":    emotionAnalysis.PrimaryEmotion,
				"analysis_date":      emotionAnalysis.CreatedAt,
				"emotion_found":      false,
			},
		}
		c.JSON(http.StatusOK, response)
		return
	}

	// สร้าง response พร้อมข้อมูล emotion
	response := gin.H{
		"patient_id": patientID,
		"latest_emotion": gin.H{
			"analysis_id":           emotionAnalysis.ID,
			"primary_emotion":       emotionAnalysis.PrimaryEmotion,
			"primary_emotion_th":    emotion.ThaiEmotionsname,
			"category":              emotion.Category,
			"analysis_date":         emotionAnalysis.CreatedAt,
			"emotion_found":         true,
		},
		"emotion_details": emotion,
	}

	c.JSON(http.StatusOK, response)
}