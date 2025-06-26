package controller

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"capstone-project/entity"
	"capstone-project/config"
)


// CreatePsychologist รับข้อมูลนักจิตวิทยา พร้อมอัปโหลดรูปใบรับรอง
func CreatePsychologist(c *gin.Context) {
	// รับข้อมูลจาก form-data
	firstName := c.PostForm("firstName")
	lastName := c.PostForm("lastName")
	gender := c.PostForm("gender")
	dobStr := c.PostForm("dob")
	phone := c.PostForm("phone")
	medicalLicense := c.PostForm("medicalLicense")
	email := c.PostForm("email")
	password := c.PostForm("password")

	// แปลงวันเกิด
	dob, err := time.Parse("2006-01-02", dobStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "รูปแบบวันเกิดไม่ถูกต้อง"})
		return
	}

	// อัปโหลดใบรับรอง
	file, err := c.FormFile("licenseImage")
	var filename string
	if err == nil && file != nil {
		timestamp := time.Now().Unix()
		filename = fmt.Sprintf("uploads/%d_%s", timestamp, file.Filename)
		if err := c.SaveUploadedFile(file, filename); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกรูปได้"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณาแนบรูปใบรับรองแพทย์"})
		return
	}

	// เข้ารหัสรหัสผ่าน
	hashed, err := config.HashPassword(password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเข้ารหัสรหัสผ่านได้"})
		return
	}

	// สร้างข้อมูลนักจิตวิทยา
	psych := entity.Psychologist{
		FirstName:      firstName,
		LastName:       lastName,
		Gender:         gender,
		DOB:            dob,
		Phone:          phone,
		MedicalLicense: medicalLicense,
		Email:          email,
		PasswordHash:   hashed,
		LicenseImage:   filename,
	}

	// ✅ บันทึกข้อมูลด้วย config.DB()
	if err := config.DB().Create(&psych).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ลงทะเบียนนักจิตวิทยาสำเร็จ", "psychologist": psych})
}
type LoginPaylead struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// PsychologistLogin สำหรับล็อกอิน
func PsychologistLogin(c *gin.Context) {
	var payload LoginPaylead
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
		return
	}

	var psychologist entity.Psychologist
	if err := config.DB().Where("email = ?", payload.Email).First(&psychologist).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "ไม่พบนักจิตวิทยาที่ใช้อีเมลนี้"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	if !config.CheckPasswordHash(payload.Password, psychologist.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "รหัสผ่านไม่ถูกต้อง"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "เข้าสู่ระบบสำเร็จ",
		"userType":    "psychologist",
		"profileName": psychologist.FirstName + " " + psychologist.LastName,
		"imagePath":   psychologist.LicenseImage,
	})
}
