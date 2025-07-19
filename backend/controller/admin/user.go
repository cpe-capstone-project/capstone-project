package admin

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /admins
func ListAdmins(c *gin.Context) {
	var admins []entity.Admin
	db := config.DB()

	if err := db.Preload("Role").Find(&admins).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, admins)
}

// GET /admins/:id
func GetAdminByID(c *gin.Context) {
	id := c.Param("id")
	var admin entity.Admin
	db := config.DB()

	if err := db.Preload("Role").First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, admin)
}

// PUT /admins/:id
func UpdateAdmin(c *gin.Context) {
	var admin entity.Admin
	id := c.Param("id")
	db := config.DB()

	if err := db.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	if err := db.Save(&admin).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update admin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin updated successfully"})
}

// DELETE /admins/:id
func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.Admin{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Admin ID not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
}

// GET /admin/profile (จาก token)
func GetAdminProfile(c *gin.Context) {
	emailRaw, exists := c.Get("email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	email := emailRaw.(string)

	var admin entity.Admin
	if err := config.DB().Preload("Role").Where("email = ?", email).First(&admin).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"first_name": admin.FirstName,
		"last_name":  admin.LastName,
		"email":      admin.Email,
		"role":       admin.Role.Role,
	})
}
