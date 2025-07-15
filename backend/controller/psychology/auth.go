package psychologist

import (
	"capstone-project/config"
	"capstone-project/entity"
	"capstone-project/services"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)
func Register(c *gin.Context) {
	db := config.DB()

	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	dobStr := c.PostForm("dob")
	phone := c.PostForm("phone")
	medicalLicense := c.PostForm("medicalLicense")
	email := strings.ToLower(strings.TrimSpace(c.PostForm("email"))) // ✅ ตรงนี้!
	password := c.PostForm("password")
	roleIDStr := c.PostForm("role_id")
	genderIDStr := c.PostForm("gender_id") // ✅

	// แปลง role_id และ gender_id
	roleIDUint64, err := strconv.ParseUint(roleIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid role ID"})
		return
	}
	roleID := uint(roleIDUint64)

	genderIDUint64, err := strconv.ParseUint(genderIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid gender ID"})
		return
	}
	genderID := uint(genderIDUint64)

	// ดึง gender เพื่อ validate
	var gender entity.Genders
	if err := db.First(&gender, genderID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Gender not found"})
		return
	}

	// ตรวจสอบ email ซ้ำ
	var existing entity.Psychologist
	if err := db.Where("email = ?", email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"message": "Email already registered"})
		return
	}

	dob, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid date format"})
		return
	}

	hashedPassword, _ := config.HashPassword(password)

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

	// บันทึก
	user := entity.Psychologist{
		FirstName:      firstName,
		LastName:       lastName,
		DOB:            dob,
		Phone:          phone,
		MedicalLicense: medicalLicense,
		Email:          email,
		PasswordHash:   hashedPassword,
		LicenseImage:   filename,
		RoleID:         roleID,
		GenderID:       genderID,
	}
//
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

	// ✅ แปลง email
	payload.Email = strings.ToLower(strings.TrimSpace(payload.Email))

	db := config.DB()
	var user entity.Psychologist

	// ✅ DEBUG
	fmt.Println("Searching for email:", payload.Email)

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
		"email":      user.Email, // ✅ เพิ่ม email
		"profile": gin.H{         // ✅ ส่งโปรไฟล์กลับไป
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"gender":     user.GenderID,
			"address":    "-", // ถ้าไม่มี field นี้ใน DB ให้ส่ง "-" ไปชั่วคราว
			"birthday":   user.DOB.Format("2006-01-02"),
			"phone":      user.Phone,
		},
	})
}
func ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()
	var user entity.Psychologist

	if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email not found"})
		return
	}

	hashedPassword, _ := config.HashPassword(req.NewPassword)
	user.PasswordHash = hashedPassword

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

