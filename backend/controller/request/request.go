package request

import (
	"net/http"
	"strconv"

	"capstone-project/config"
	"capstone-project/entity"
	"github.com/gin-gonic/gin"
)

// POST /requests
func CreateRequest(c *gin.Context) {
	var body entity.Request
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json: " + err.Error()})
		return
	}

	if body.PatientID == 0 || body.PsychologistID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "patient_id and psychologist_id are required"})
		return
	}
	if body.Type == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "type is required"})
		return
	}
	if body.Detail == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "detail is required"})
		return
	}

	if err := config.DB().Create(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, body)
}

// GET /requests/by-psychologist?psychologist_id=1
func GetRequestsByPsych(c *gin.Context) {
	pidStr := c.Query("psychologist_id")
	if pidStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "psychologist_id is required"})
		return
	}
	pid64, err := strconv.ParseUint(pidStr, 10, 0)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "psychologist_id must be a number"})
		return
	}
	pid := uint(pid64)

	var list []entity.Request
	if err := config.DB().
		Where("psychologist_id = ?", pid).
		Order("created_at desc").
		Preload("Patient").
		Preload("Psychologist").
		Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}
