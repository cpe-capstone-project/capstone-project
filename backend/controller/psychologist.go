package controller

// import (
// 	"fmt"
// 	"net/http"
// 	"time"
// 	"os"

// 	"github.com/gin-gonic/gin"
// 	"capstone-project/entity"
// 	"capstone-project/config"
// 	"capstone-project/services"
// )

// // CreatePsychologist รับข้อมูลนักจิตวิทยา พร้อมอัปโหลดรูปใบรับรอง
// func CreatePsychologist(c *gin.Context) {
// 	// รับข้อมูลจาก form-data
// 	firstName := c.PostForm("firstName")
// 	lastName := c.PostForm("lastName")
// 	gender := c.PostForm("gender")
// 	dobStr := c.PostForm("dob")
// 	phone := c.PostForm("phone")
// 	medicalLicense := c.PostForm("medicalLicense")
// 	email := c.PostForm("email")
// 	password := c.PostForm("password")

// 	// ตรวจสอบว่าข้อมูลจำเป็นครบหรือไม่
// 	if firstName == "" || lastName == "" || gender == "" || dobStr == "" || phone == "" || medicalLicense == "" || email == "" || password == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณากรอกข้อมูลให้ครบถ้วน"})
// 		return
// 	}

// 	// ตรวจสอบอีเมลซ้ำ
// 	var existing entity.Psychologist
// 	if err := config.DB().Where("email = ?", email).First(&existing).Error; err == nil {
// 		c.JSON(http.StatusConflict, gin.H{"message": "อีเมลนี้ถูกใช้งานแล้ว"})
// 		return
// 	}

// 	// แปลงวันเกิด
// 	dob, err := time.Parse("2006-01-02", dobStr)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "รูปแบบวันเกิดไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)"})
// 		return
// 	}

// 	// อัปโหลดรูปใบรับรอง
// 	file, err := c.FormFile("licenseImage")
// 	if err != nil || file == nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "กรุณาแนบรูปใบรับรองแพทย์"})
// 		return
// 	}

// 	// สร้าง path สำหรับเก็บรูป
// 	timestamp := time.Now().Unix()
// 	filename := fmt.Sprintf("uploads/%d_%s", timestamp, file.Filename)
// 	if err := c.SaveUploadedFile(file, filename); err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกรูปได้"})
// 		return
// 	}

// 	// เข้ารหัสรหัสผ่าน
// 	hashed, err := config.HashPassword(password)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถเข้ารหัสรหัสผ่านได้"})
// 		return
// 	}

// 	// สร้าง struct และบันทึก
// 	psych := entity.Psychologist{
// 		FirstName:      firstName,
// 		LastName:       lastName,
// 		Gender:         gender,
// 		DOB:            dob,
// 		Phone:          phone,
// 		MedicalLicense: medicalLicense,
// 		Email:          email,
// 		PasswordHash:   hashed,
// 		LicenseImage:   filename,
// 	}
// 	if err := config.DB().Create(&psych).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถบันทึกข้อมูลได้"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "ลงทะเบียนนักจิตวิทยาสำเร็จ", "psychologist": psych})
// }

// // LoginPaylead สำหรับรับข้อมูลล็อกอิน
// type LoginPaylead struct {
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

// func PsychologistLogin(c *gin.Context) {
// 	var payload LoginPaylead
// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
// 		return
// 	}

// 	var psychologist entity.Psychologist
// 	if err := config.DB().Where("email = ?", payload.Email).First(&psychologist).Error; err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "ไม่พบนักจิตวิทยาที่ใช้อีเมลนี้"})
// 		return
// 	}

// 	if !config.CheckPasswordHash(payload.Password, psychologist.PasswordHash) {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "รหัสผ่านไม่ถูกต้อง"})
// 		return
// 	}

// 	jwtWrapper := services.JwtWrapper{
// 		SecretKey:       os.Getenv("JWT_SECRET"), // ควรตั้งใน env
// 		Issuer:          "PsychologistAuthService",
// 		ExpirationHours: 24,
// 	}

// 	token, err := jwtWrapper.GenerateToken(
// 		psychologist.Email,
// 		"psychologist",
// 		psychologist.ID,
// 		psychologist.FirstName+" "+psychologist.LastName,
// 		psychologist.LicenseImage,
// 	)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"message": "ไม่สามารถสร้าง token ได้"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 	"message":     "เข้าสู่ระบบสำเร็จ",
// 	"token_type":  "Bearer",
// 	"token":       token,
// 	"id":          psychologist.ID,
// 	"role":        "psychologist",
// 	"profileName": psychologist.FirstName + " " + psychologist.LastName,
// 	"imagePath":   psychologist.LicenseImage,
// })

// }