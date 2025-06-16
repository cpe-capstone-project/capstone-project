package diary

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /diaries?sort=updated_at&order=asc
func ListDiaries(c *gin.Context){
	var diaries []entity.Diaries
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

	results := db.Find(&diaries)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diaries)
}

// GET /diary/:id
func GetDiaryByID(c *gin.Context){
	ID := c.Param("id")
	var diary entity.Diaries

	db := config.DB()
	results := db.First(&diary, ID)
	if results.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if diary.ID == 0{
		c.JSON(http.StatusNoContent, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diary)
}

// POST /diary
func CreateDiary(c *gin.Context){
	var diary entity.Diaries

	//bind เข้าตัวแปร diary
	if err := c.ShouldBindJSON(&diary); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	bc := entity.Diaries{
		Title: diary.Title,
		Content: diary.Content,
		TherapyCaseID: diary.TherapyCaseID,
	}

	//บันทึก
	if err := db.Create(&bc).Error; err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bc)
}

// PATCH /diary/:id
func UpdateDiaryByID(c *gin.Context){
	var diary entity.Diaries
	diaryID := c.Param("id")
	db := config.DB()
	
	result := db.First(&diary, diaryID)
	if result.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&diary); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	result = db.Save(&diary)
	if result.Error != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
}

// DELETE /diary/:id
func DeleteDiary(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.Diaries{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}