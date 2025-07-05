package psychologist

import (
	"capstone-project/config"
	"capstone-project/entity"
	"capstone-project/services"
	"fmt"
	"net/http"
	"time"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	db := config.DB()

	var (
		firstName      = c.PostForm("firstName")
		lastName       = c.PostForm("lastName")
		gender         = c.PostForm("gender")
		dobStr         = c.PostForm("dob")
		phone          = c.PostForm("phone")
		medicalLicense = c.PostForm("medicalLicense")
		email          = c.PostForm("email")
		password       = c.PostForm("password")
	)

	// ตรวจสอบซ้ำ
	var existing entity.Psychologist
	if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Email already registered"})
		return
	}

	// แปลงวันเกิด
	dob, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid date format"})
		return
	}

	// hash password
	hashedPassword, _ := config.HashPassword(password)

	// รับรูป
	file, err := c.FormFile("licenseImage")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing license image"})
		return
	}
	filename := fmt.Sprintf("uploads/licenses/%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to save file"})
		return
	}

	// สร้างข้อมูล
	user := entity.Psychologist{
		FirstName:      firstName,
		LastName:       lastName,
		Gender:         gender,
		DOB:            dob,
		Phone:          phone,
		MedicalLicense: medicalLicense,
		Email:          email,
		PasswordHash:   hashedPassword,
		LicenseImage:   filename,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Register successful"})
}

func Login(c *gin.Context) {
	var payload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db := config.DB()
	var user entity.Psychologist
	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(payload.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	jwt := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	token, err := jwt.GenerateToken(user.Email, "Psychologist")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      token,
		"id":         user.ID,
		"role":       "Psychologist",
	})
}
