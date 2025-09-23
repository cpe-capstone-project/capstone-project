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
// DELETE /delall-emotion-analysis/:id
func DeleteEmotionAnalysisByPatientID(c *gin.Context) {
	patientID := c.Param("id")
	
	db := config.DB()

	// เริ่ม transaction เพื่อให้การลบเกิดขึ้นพร้อมกันหรือไม่เกิดขึ้นเลย
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
		return
	}

	// ตรวจสอบว่า Patient มีอยู่จริงหรือไม่
	var count int64
	if err := tx.Model(&entity.Patients{}).Where("id = ?", patientID).Count(&count).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check patient"})
		return
	}
	if count == 0 {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "ERROR: PATIENT ID NOT FOUND"})
		return
	}

	// หา EmotionAnalysisResults ทั้งหมดของ Patient คนนี้
	var emotionAnalysisResults []entity.EmotionAnalysisResults
	if err := tx.Where("patient_id = ?", patientID).Find(&emotionAnalysisResults).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find emotion analysis results"})
		return
	}

	// ถ้าไม่มีข้อมูลให้ลบ
	if len(emotionAnalysisResults) == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis results found for this patient"})
		return
	}

	// รวบรวม ID ของ EmotionAnalysisResults เพื่อใช้ในการลบ SubEmotionAnalysis
	var emotionAnalysisIDs []uint
	for _, result := range emotionAnalysisResults {
		emotionAnalysisIDs = append(emotionAnalysisIDs, result.ID)
	}

	// ลบ SubEmotionAnalysis ที่เกี่ยวข้องก่อน (เพราะเป็น child record)
	if err := tx.Where("emotion_analysis_results_id IN ?", emotionAnalysisIDs).Delete(&entity.SubEmotionAnalysis{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete sub emotion analysis records"})
		return
	}

	// ลบ EmotionAnalysisResults
	if err := tx.Where("patient_id = ?", patientID).Delete(&entity.EmotionAnalysisResults{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete emotion analysis results"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "All emotion analysis records deleted successfully for patient",
		"patient_id": patientID,
		"deleted_emotion_analysis_count": len(emotionAnalysisResults),
	})
}