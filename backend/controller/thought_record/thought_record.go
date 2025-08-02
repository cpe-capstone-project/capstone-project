package thought_record

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	// "strconv"

	"github.com/gin-gonic/gin"
)

// GET /thought_record?sort=updated_at&order=asc
func ListThoughtRecord(c *gin.Context){
	var record []entity.ThoughtRecord
	db := config.DB()

	sortField := c.DefaultQuery("sort", "updated_at")
	order := c.DefaultQuery("order", "desc")
	

	// ตรวจสอบว่า order มีค่าถูกต้องหรือไม่
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
		sortColumn = "updated_at" // fallback
	}
	db = db.Order(sortColumn + " " + order)

	results := db.Find(&record)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, record)
}

// GET /diary/:id
func GetThoughtRecordByID(c *gin.Context){
	ID := c.Param("id")
	var record entity.ThoughtRecord

	db := config.DB()
	results := db.First(&record, ID)
	if results.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if record.ID == 0{
		c.JSON(http.StatusNoContent, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, record)
}

// POST /diary
func CreateThoughtRecord(c *gin.Context){
	var record entity.ThoughtRecord

	//bind เข้าตัวแปร diary
	if err := c.ShouldBindJSON(&record); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// defaultColors := "#FFC107,#FF9800,#FF5722"
	// if diary.TagColors == "" {
	// 	diary.TagColors = defaultColors
	// }

	db := config.DB()

	bc := entity.ThoughtRecord{
		Situation: record.Situation,
		Thoughts: record.Thoughts,
		Behaviors: record.Behaviors,
		AlternateThought: record.AlternateThought,
		TherapyCaseID: record.TherapyCaseID,
		EmotionsID: record.EmotionsID,
	}


	//บันทึก
	if err := db.Create(&bc).Error; err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bc)
}

// PATCH /diary/:id
func UpdateThoughtRecordByID(c *gin.Context){
	var record entity.ThoughtRecord
	recordID := c.Param("id")
	db := config.DB()
	
	result := db.First(&record, recordID)
	if result.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&record); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	// defaultColors := "#FFC107,#FF9800,#FF5722"
	// if record.TagColors == "" {
	// 	record.TagColors = defaultColors
	// }

	result = db.Save(&record)
	if result.Error != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
}

// DELETE /diary/:id
func DeleteThoughtRecord(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.ThoughtRecord{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}
