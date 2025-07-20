package routers

import (
	"capstone-project/controller/admin"
	"capstone-project/controller/patient"
	"capstone-project/controller/psychology"
	"capstone-project/middlewares"

	"github.com/gin-gonic/gin"
)
func SetupAdminRoutes(r *gin.Engine) {
	r.POST("/admin/signin", admin.AdminSignIn)
	r.GET("/admin/patients", patient.GetAllPatients)
	r.GET("/admin/psychologists",psychologist.GetAllPsychologists)
	adminRoutes := r.Group("/admins")
	adminRoutes.Use(middlewares.Authorizes("Admin"))
	adminRoutes.GET("", admin.ListAdmins)
	adminRoutes.GET("/:id", admin.GetAdminByID)
	adminRoutes.PUT("/:id", admin.UpdateAdmin)
	adminRoutes.DELETE("/:id", admin.DeleteAdmin)
	r.GET("/admin/profile", middlewares.Authorizes("Admin"), admin.GetAdminProfile)
}
