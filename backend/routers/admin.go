package routers

import (
	"capstone-project/controller/admin"
	"capstone-project/middlewares"
	"github.com/gin-gonic/gin"
)
func SetupAdminRoutes(r *gin.Engine) {
	r.POST("/admin/signin", admin.AdminSignIn)
	adminRoutes := r.Group("/admins")
	adminRoutes.Use(middlewares.Authorizes("Admin"))

	adminRoutes.GET("", admin.ListAdmins)
	adminRoutes.GET("/:id", admin.GetAdminByID)
	adminRoutes.PUT("/:id", admin.UpdateAdmin)
	adminRoutes.DELETE("/:id", admin.DeleteAdmin)
	r.GET("/admin/profile", middlewares.Authorizes("Admin"), admin.GetAdminProfile)
}
