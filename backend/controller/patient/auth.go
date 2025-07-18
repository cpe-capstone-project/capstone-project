package patient

import (
	"capstone-project/config"
	"capstone-project/entity"
	"capstone-project/services"
	"errors"
	"fmt"

	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type (
	Authen struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	signUp struct {
		FirstName string    `json:"first_name"`
		LastName  string    `json:"last_name"`
		Email     string    `json:"email"`
		Phone     string    `json:"phone"`
		Age       uint8     `json:"age"`
		BirthDay  time.Time `json:"birthday"`
		Password  string    `json:"password"`
		Picture   string    `json:"picture"`
		GenderID  uint      `json:"gender_id"`
		RoleID    uint      `json:"role_id"`
		Consent   bool      `json:"consent"`  // ✅ เพิ่ม
  		Address   string    `json:"address"`  // ✅ เพิ่ม
		PsychologistID uint `json:"psychologist_id"`
  		Psychologist   *entity.Psychologist
	}
)

func SignUp(c *gin.Context) {
	var payload signUp
	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	var patient entity.Patients
	// var userCheck2 entity.Employees

	// Check if the user with the provided email already exists
	result1 := db.Where("email = ?", payload.Email).First(&patient)
	if result1.Error != nil && !errors.Is(result1.Error, gorm.ErrRecordNotFound) {
		// If there's a database error other than "record not found"
		c.JSON(http.StatusInternalServerError, gin.H{"error": result1.Error.Error()})
		return

	}

	// result2 := db.Where("email = ?", payload.Email).First(&userCheck2)
	// if result2.Error != nil && !errors.Is(result2.Error, gorm.ErrRecordNotFound) {
	// 	// If there's a database error other than "record not found"
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": result2.Error.Error()})
	// 	return

	// }

	// if patient.ID != 0 || userCheck2.ID != 0 {
	// 	c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
	// 	return

	// }

	if patient.ID != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
		return

	}

	// Hash the user's password
	hashedPassword, _ := config.HashPassword(payload.Password)

	// Create a new user
	user := entity.Patients{

		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		Email:     payload.Email,
		Phone:     payload.Phone,
		Age:       payload.Age,
		BirthDay:  payload.BirthDay,
		Password:  hashedPassword,
		Image:     payload.Picture,
		GenderID:  payload.GenderID,
		RoleID:    payload.RoleID, // ✅ ใช้ค่าที่ส่งมาจริงนะครับ
		Consent:   payload.Consent,  // ✅ เพิ่ม
  		Address:   payload.Address,  // ✅ เพิ่ม
		PsychologistID: payload.PsychologistID, // ✅ เพิ่มตรงนี้
	}

	// Save the user to the database

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful"})
}

func SignIn(c *gin.Context) {
	var payload Authen
	var patient entity.Patients
	var role string
	var roleID uint

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	fmt.Println("Payload Email:", payload.Email)

	db := config.DB()

	// ตรวจสอบในตาราง Patients
	if err := db.Where("email = ?", payload.Email).First(&patient).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email not found"})
		return
	}

	// ตรวจสอบรหัสผ่าน
	err := bcrypt.CompareHashAndPassword([]byte(patient.Password), []byte(payload.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "password is incorrect"})
		return
	}

	// ดึง role
	roleID = patient.RoleID
	var roleEntity entity.Roles
	if err := db.Where("id = ?", roleID).First(&roleEntity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "role not found"})
		return
	}
	role = roleEntity.Role

	// สร้าง JWT Token
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(patient.Email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// ส่งผลลัพธ์กลับ (พร้อม profile)
	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      signedToken,
		"id":         patient.ID,
		"role":       role,
		"email":      patient.Email,
		"profile": gin.H{
			"first_name": patient.FirstName,
			"last_name":  patient.LastName,
			"gender":     patient.GenderID,
			"address":    patient.Address,
			"birthday":   patient.BirthDay.Format("2006-01-02"),
			"phone":      patient.Phone,
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
	var patient entity.Patients

	if err := db.Where("email = ?", req.Email).First(&patient).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email not found"})
		return
	}

	hashedPassword, _ := config.HashPassword(req.NewPassword)
	patient.Password = hashedPassword

	if err := db.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
func UpdateProfile(c *gin.Context) {
	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		GenderID  uint   `json:"gender_id"`
		Address   string `json:"address"`
		Birthday  string `json:"birthday"` // รับแบบ string
		Phone     string `json:"phone"`
		Email     string `json:"email"`
		Image     string `json:"image"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()
	var patient entity.Patients
	if err := db.Where("email = ?", req.Email).First(&patient).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// อัปเดตค่า
	patient.FirstName = req.FirstName
	patient.LastName = req.LastName
	patient.GenderID = req.GenderID
	patient.Address = req.Address
	patient.Phone = req.Phone
	patient.Image = req.Image

	if t, err := time.Parse("2006-01-02", req.Birthday); err == nil {
		patient.BirthDay = t
	}

	if err := db.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
func VerifyPsychologistCode(c *gin.Context) {
	var req struct {
		Code string `json:"code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "คำขอไม่ถูกต้อง"})
		return
	}

	db := config.DB()
	var psychs []entity.Psychologist

	// ✅ ดึงนักจิตทุกคน
	if err := db.Find(&psychs).Error; err != nil {
		c.JSON(500, gin.H{"error": "ไม่สามารถเชื่อมต่อฐานข้อมูลได้"})
		return
	}

	var matchedPsychologistID uint
	for _, p := range psychs {
		if bcrypt.CompareHashAndPassword([]byte(p.VerifyCodeHash), []byte(req.Code)) == nil {
			matchedPsychologistID = p.ID
			break
		}
	}

	if matchedPsychologistID == 0 {
		c.JSON(400, gin.H{"error": "PIN ไม่ถูกต้อง"})
		return
	}

	// ✅ ตอบกลับด้วย ID ของนักจิตที่ตรงกับ PIN
	c.JSON(200, gin.H{
		"message":          "PIN ถูกต้อง",
		"psychologist_id":  matchedPsychologistID,
	})
}


// func SignIn(c *gin.Context) {
// 	var payload Authen
// 	var patient entity.Patients
// 	// var employee entity.Employees
// 	var role string
// 	var roleID uint
// 	var found bool = false

// 	if err := c.ShouldBindJSON(&payload); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
// 		return
// 	}

// 	fmt.Println("Payload Email/Username:", payload.Email)

// 	db := config.DB()

// 	// ตรวจสอบในตาราง Patients
// 	if err := db.Where("email = ?", payload.Email, payload.Email).First(&patient).Error; err == nil {
// 		found = true
// 		roleID = patient.RoleID
// 	} else {
// 		fmt.Println("patient ::", err)
// 	}

// 	if !found {
// 		if err := db.Where("email = ?", payload.Email, payload.Email).First(&employee).Error; err == nil {
// 			found = true
// 			roleID = employee.RoleID
// 		} else {
// 			fmt.Println("Employee ::", err)
// 		}
// 	}

// 	// หากไม่พบข้อมูลในทั้งสองตาราง
// 	if !found {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": "email not found"})
// 		return
// 	}

// 	var hashedPassword string
// 	if patient.ID != 0 {
// 		hashedPassword = patient.Password
// 	} else {
// 		hashedPassword = employee.Password
// 	}

// 	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(payload.Password))
// 	if err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"error": "password is incorrect"})
// 		return
// 	}

// 	var roleEntity entity.Roles
// 	if err := db.Where("id = ?", roleID).First(&roleEntity).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "role not found"})
// 		return
// 	}

// 	role = roleEntity.Role

// 	var email string
// 	var userID uint
// 	// if employee.ID != 0 {
// 	//     email = employee.Email
// 	//     userID = employee.ID
// 	// } else if patient.ID != 0 {
// 	//     email = patient.Email
// 	//     userID = patient.ID
// 	// }
// 	if patient.ID != 0 {
// 		email = patient.Email
// 		userID = patient.ID
// 	}

// 	// สร้าง JWT Token
// 	jwtWrapper := services.JwtWrapper{
// 		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
// 		Issuer:          "AuthService",
// 		ExpirationHours: 24,
// 	}

// 	signedToken, err := jwtWrapper.GenerateToken(email, role)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
// 		return
// 	}

// 	fmt.Println("Role:", email)
// 	fmt.Println("Role:", role)
// 	fmt.Println("Generated Token:", signedToken)

// 	c.JSON(http.StatusOK, gin.H{
// 		"token_type": "Bearer",
// 		"token":      signedToken,
// 		"id":         userID,
// 		"role":       role,
// 	})
// }
