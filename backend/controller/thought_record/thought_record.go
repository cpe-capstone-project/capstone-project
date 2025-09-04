package thought_record

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"strconv"


	"github.com/gin-gonic/gin"
)

// GET /thought_record?sort=updated_at&order=asc
func ListThoughtRecord(c *gin.Context){
	var record []entity.ThoughtRecord
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
	db = db.Order(sortColumn + " " + order)

	if results := db.Preload("Emotion").Find(&record); results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, record)
}

// GET /thought_record/:id
func GetThoughtRecordByID(c *gin.Context){
	ID := c.Param("id")
	var record entity.ThoughtRecord

	db := config.DB()
	results := db.Preload("Emotion").First(&record, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, record)
}

// POST /thought_record
func CreateThoughtRecord(c *gin.Context){
	var record entity.ThoughtRecord

	if err := c.ShouldBindJSON(&record); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// บันทึกตรง ๆ จาก record ที่ bind มา
	if err := db.Create(&record).Error; err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, record)
}

// PATCH /thought_record/:id
func UpdateThoughtRecordByID(c *gin.Context){
	var record entity.ThoughtRecord
	recordID := c.Param("id")
	db := config.DB()
	
	if err := db.First(&record, recordID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	var input entity.ThoughtRecord
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดตเฉพาะ field ที่ส่งมา
	if err := db.Model(&record).Updates(input).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
}

// DELETE /thought_record/:id
func DeleteThoughtRecord(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.ThoughtRecord{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}

// GET /thought_record/latest?limit=5
// GET /thought_record/latest?limit=5
func ListLatestThoughtRecords(c *gin.Context) {
	var records []entity.ThoughtRecord
	db := config.DB()

	// ดึง limit จาก query string
	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 5
	}

	// ดึง ThoughtRecord ล่าสุด พร้อม preload Emotion
	if err := db.Preload("Emotion").
		Order("updated_at desc").
		Limit(limit).
		Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, records)
}


func GetThoughtRecordsByTherapyCaseID(c *gin.Context) {
    therapyCaseID := c.Param("id") // รับ TherapyCase ID จาก URL

    var thoughtRecords []entity.ThoughtRecord

    db := config.DB()
    // ดึง ThoughtRecords ของ TherapyCase ตาม ID พร้อม preload TherapyCase, Patient, CaseStatus
    result := db.Preload("TherapyCase.Patient").
                 Preload("TherapyCase.CaseStatus").
                 Where("therapy_case_id = ?", therapyCaseID).
                 Find(&thoughtRecords)

    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
        return
    }

    if len(thoughtRecords) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }

    c.JSON(http.StatusOK, thoughtRecords)
}

