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

	if results := db.Find(&record); results.Error != nil {
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
	results := db.First(&record, ID)
	if results.Error != nil{
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

// controller/thought_record/thought_record.go

// GET /patients/:patientId/thought-records?limit=1
func GetLatestThoughtRecordsByPatientID(c *gin.Context) {
    pid := c.Param("patientId")
    limitStr := c.DefaultQuery("limit", "1")
    limit, _ := strconv.Atoi(limitStr)
    if limit < 1 { limit = 1 }

    var items []entity.ThoughtRecord
    db := config.DB()

    // ถ้า ThoughtRecord มี therapy_case_id และ TherapyCase มี patient_id
    q := db.Model(&entity.ThoughtRecord{}).
        Joins("JOIN therapy_cases tc ON tc.id = thought_records.therapy_case_id").
        Where("tc.patient_id = ?", pid).
        Order("thought_records.updated_at DESC").
        Limit(limit)

    if err := q.Preload("TherapyCase.Patient").Preload("TherapyCase.CaseStatus").Find(&items).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ส่งแบบยืดหยุ่น: [] ตรง ๆ ก็ได้ หรือ {items:[...]}
    c.JSON(http.StatusOK, gin.H{"items": items})
}

// GET /patients/:patientId/thought-records/count
func GetThoughtRecordCountByPatientID(c *gin.Context) {
    pid := c.Param("patientId")
    db := config.DB()

    var cnt int64
    // นับผ่าน join เดียวกัน
    if err := db.Model(&entity.ThoughtRecord{}).
        Joins("JOIN therapy_cases tc ON tc.id = thought_records.therapy_case_id").
        Where("tc.patient_id = ?", pid).
        Count(&cnt).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"count": cnt})
}

