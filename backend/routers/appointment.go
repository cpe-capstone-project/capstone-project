package routers

import (
	"capstone-project/middlewares"
	"capstone-project/controller/appointment"
	"github.com/gin-gonic/gin"
)

func SetupAppointmentRoutes(r *gin.Engine) {
	// ✅ Authenticated routes (ต้องมี token)
	r.POST("/appointments/create", middlewares.Authorizes(), appointment.CreateAppointment)
	r.GET("/appointments/by-psychologist", middlewares.Authorizes(), appointment.GetAppointmentsByPsychologist)
	r.GET("/appointments/by-patient", middlewares.Authorizes(), appointment.GetAppointmentsByPatient)
	r.PUT("/appointments/status", middlewares.Authorizes(), appointment.UpdateAppointmentStatus)
	r.DELETE("/appointments/:id", middlewares.Authorizes(), appointment.DeleteAppointment)
	r.PUT("/appointments/update-time", middlewares.Authorizes(), appointment.UpdateAppointmentTime)


}
