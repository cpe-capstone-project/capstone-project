package admin

import (
	"capstone-project/config"
	"capstone-project/entity"
	"capstone-project/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func AdminSignIn(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()
	var admin entity.Admin

	if err := db.Where("email = ?", req.Email).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Admin not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Incorrect password"})
		return
	}

	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}
	token, err := jwtWrapper.GenerateToken(admin.Email, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"token_type": "Bearer",
		"id":         admin.ID,
		"email":      admin.Email,
		"role":       "Admin",
		"profile": gin.H{
			"first_name": admin.FirstName,
			"last_name":  admin.LastName,
		},
	})
}
func GetPendingPsychologists(c *gin.Context) {
    var list []entity.PendingPsychologist
    db := config.DB()

    if err := db.Preload("Gender").Find(&list).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pending list"})
        return
    }

    var result []gin.H
    for _, p := range list {
        result = append(result, gin.H{
            "id": p.ID,
            "first_name": p.FirstName,
            "last_name": p.LastName,
            "email": p.Email,
            "age": p.Age,
            "gender_id": p.GenderID,
            "dob": p.DOB.Format("2006-01-02"),
            "phone": p.Phone,
            "medical_license": p.MedicalLicense,
            "license_image": p.LicenseImage,
        })
    }

    c.JSON(http.StatusOK, result)
}