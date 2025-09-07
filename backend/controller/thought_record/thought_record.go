package thought_record

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ---------------------------
// GET /thought_record?sort=updated_at&order=asc
// ---------------------------
func ListThoughtRecord(c *gin.Context) {
	var records []entity.ThoughtRecord
	db := config.DB()

	sortField := c.DefaultQuery("sort", "updated_at")
	order := c.DefaultQuery("order", "desc")
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	var sortColumn string
	switch sortField {
	case "CreatedAt":
		sortColumn = "created_at"
	case "UpdatedAt":
		sortColumn = "updated_at"
	default:
		sortColumn = "updated_at"
	}

	if err := db.Preload("Emotions").
		Preload("SituationTag").
		Order(sortColumn + " " + order).
		Find(&records).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, records)
}

// ---------------------------
// GET /thought_record/:id
// ---------------------------
func GetThoughtRecordByID(c *gin.Context) {
	id := c.Param("id")
	var record entity.ThoughtRecord

	db := config.DB()
	if err := db.Preload("Emotions").
		Preload("SituationTag").
		First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
		return
	}

	c.JSON(http.StatusOK, record)
}

// ---------------------------
// POST /thought_record
// ---------------------------
type ThoughtRecordInput struct {
	Situation        string `json:"Situation" binding:"required"`
	Thoughts         string `json:"Thoughts" binding:"required"`
	Behaviors        string `json:"Behaviors"`
	AlternateThought string `json:"AlternateThought"`
	TagColors        string `json:"TagColors" binding:"required"`
	TherapyCaseID    uint   `json:"TherapyCaseID"`
	EmotionsID       []uint `json:"EmotionsID"`
	SituationTagID   uint   `json:"SituationTagID" binding:"required"`
}

func CreateThoughtRecord(c *gin.Context) {
	var input ThoughtRecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// Map EmotionsID ไปหา Emotions objects
	var emotions []entity.Emotions
	if len(input.EmotionsID) > 0 {
		if err := db.Where("id IN ?", input.EmotionsID).Find(&emotions).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid emotions"})
			return
		}
	}

	record := entity.ThoughtRecord{
		Situation:        input.Situation,
		Thoughts:         input.Thoughts,
		Behaviors:        input.Behaviors,
		AlternateThought: input.AlternateThought,
		TagColors:        input.TagColors,
		TherapyCaseID:    input.TherapyCaseID,
		SituationTagID:   input.SituationTagID,
		Emotions:         emotions,
	}

	if err := db.Create(&record).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// preload ให้ response คืนมี SituationTag
	db.Preload("Emotions").Preload("SituationTag").First(&record, record.ID)

	c.JSON(http.StatusCreated, record)
}

// ---------------------------
// PATCH /thought_record/:id
// ---------------------------
func UpdateThoughtRecordByID(c *gin.Context) {
	id := c.Param("id")
	var record entity.ThoughtRecord
	db := config.DB()

	if err := db.Preload("Emotions").
		Preload("SituationTag").
		First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
		return
	}

	var input ThoughtRecordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดต fields
	updateData := map[string]interface{}{
		"Situation":        input.Situation,
		"Thoughts":         input.Thoughts,
		"Behaviors":        input.Behaviors,
		"AlternateThought": input.AlternateThought,
		"TagColors":        input.TagColors,
		"TherapyCaseID":    input.TherapyCaseID,
		"SituationTagID":   input.SituationTagID,
	}

	if err := db.Model(&record).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดต Emotions associations
	if len(input.EmotionsID) > 0 {
		var emotions []entity.Emotions
		if err := db.Where("id IN ?", input.EmotionsID).Find(&emotions).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid emotions"})
			return
		}
		if err := db.Model(&record).Association("Emotions").Replace(emotions); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	// reload พร้อม relations
	db.Preload("Emotions").Preload("SituationTag").First(&record, record.ID)

	c.JSON(http.StatusOK, record)
}

// ---------------------------
// DELETE /thought_record/:id
// ---------------------------
func DeleteThoughtRecord(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.ThoughtRecord{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted successful"})
}

// ---------------------------
// GET /thought_record/latest?limit=5
// ---------------------------
func ListLatestThoughtRecords(c *gin.Context) {
	db := config.DB()
	var records []entity.ThoughtRecord

	limitStr := c.DefaultQuery("limit", "5")
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 5
	}

	if err := db.Preload("Emotions").
		Preload("SituationTag").
		Order("updated_at desc").
		Limit(limit).
		Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, records)
}

// ---------------------------
// GET /thoughtrecords/case/:id
// ---------------------------
func GetThoughtRecordsByTherapyCaseID(c *gin.Context) {
	therapyCaseID := c.Param("id")
	db := config.DB()
	var records []entity.ThoughtRecord

	if err := db.Preload("TherapyCase.Patient").
		Preload("TherapyCase.CaseStatus").
		Preload("Emotions").
		Preload("SituationTag").
		Where("therapy_case_id = ?", therapyCaseID).
		Find(&records).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if len(records) == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}

	c.JSON(http.StatusOK, records)
}

// ---------------------------
// GET /patients/:patientId/thought-records?limit=1
// ---------------------------
func GetLatestThoughtRecordsByPatientID(c *gin.Context) {
	pid := c.Param("patientId")
	db := config.DB()
	limitStr := c.DefaultQuery("limit", "1")
	limit, _ := strconv.Atoi(limitStr)
	if limit < 1 {
		limit = 1
	}

	var items []entity.ThoughtRecord
	q := db.Model(&entity.ThoughtRecord{}).
		Joins("JOIN therapy_cases tc ON tc.id = thought_records.therapy_case_id").
		Where("tc.patient_id = ?", pid).
		Order("thought_records.updated_at DESC").
		Limit(limit)

	if err := q.Preload("TherapyCase.Patient").
		Preload("TherapyCase.CaseStatus").
		Preload("Emotions").
		Preload("SituationTag").
		Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

// ---------------------------
// GET /patients/:patientId/thought-records/count
// ---------------------------
func GetThoughtRecordCountByPatientID(c *gin.Context) {
	pid := c.Param("patientId")
	db := config.DB()

	var cnt int64
	if err := db.Model(&entity.ThoughtRecord{}).
		Joins("JOIN therapy_cases tc ON tc.id = thought_records.therapy_case_id").
		Where("tc.patient_id = ?", pid).
		Count(&cnt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"count": cnt})
}
