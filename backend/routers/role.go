package routers

import (
	"capstone-project/controller/role"
	"github.com/gin-gonic/gin"
)

func SetupRoleRoutes(r *gin.RouterGroup) {
	r.GET("/roles", role.ListRoles)
	r.GET("/role/:id", role.GetRoleByID)
}
