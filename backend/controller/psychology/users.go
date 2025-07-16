package psychologist

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ListPsychologists(c *gin.Context) {
	var users []entity.Psychologist
	db := config.DB()
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetPsychologistByID(c *gin.Context) {
	id := c.Param("id")
	var user entity.Psychologist
	db := config.DB()
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

func UpdatePsychologist(c *gin.Context) {
	id := c.Param("id")
	var user entity.Psychologist
	db := config.DB()
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ID not found"})
		return
	}
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Update failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Updated successfully"})
}

func DeletePsychologist(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	if tx := db.Delete(&entity.Psychologist{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
func GetProfile(c *gin.Context) {
	emailRaw, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email := emailRaw.(string)

	var psychologist entity.Psychologist
	if err := config.DB().Preload("Gender").Where("email = ?", email).First(&psychologist).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Psychologist not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"first_name": psychologist.FirstName,
		"last_name":  psychologist.LastName,
		"gender":     psychologist.GenderID,
		"address":    "-", // ไม่มี field นี้ใน Psychologist
		"birthday":   psychologist.DOB.Format("2006-01-02"),
		"phone":      psychologist.Phone,
		"email":      psychologist.Email,
		"image":      psychologist.LicenseImage, // ใช้แทน profile image
	})
}