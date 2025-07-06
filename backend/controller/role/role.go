package role

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ListRoles(c *gin.Context) {
	var roles []entity.Roles
	db := config.DB()
	results := db.Find(&roles)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, roles)
}

func GetRoleByID(c *gin.Context) {
	ID := c.Param("id")
	var role entity.Roles
	db := config.DB()
	results := db.First(&role, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if role.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{})
		return
	}

	c.JSON(http.StatusOK, role)
}
//lll
