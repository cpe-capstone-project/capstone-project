package controller

import (
	"net/http"
	"capstone-project/config"
	"github.com/gin-gonic/gin"
	"capstone-project/entity"
)

func CreatePatient(c *gin.Context) {
	var patient entity.Patient
	if err := c.ShouldBindJSON(&patient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// แปลง password ให้เป็น hash ก่อนบันทึก
	hashedPassword, err := config.HashPassword(patient.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	patient.Password = hashedPassword

	// ✅ ใช้ config.DB()
	if err := config.DB().Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save patient"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Patient registered successfully"})
}
type LoginPayload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func PatientLogin(c *gin.Context) {
	var payload LoginPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	var patient entity.Patient
	if err := config.DB().Where("email = ?", payload.Email).First(&patient).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	// เช็ครหัสผ่าน hashed
	if !config.CheckPasswordHash(payload.Password, patient.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Login successful",
		"userType":    "patient",
		"profileName": patient.FirstName + " " + patient.LastName,
	})
}
