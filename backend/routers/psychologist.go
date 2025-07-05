package routers

import (
	psyauth "capstone-project/controller/psychology"
	psyuser "capstone-project/controller/psychology"

	"github.com/gin-gonic/gin"
)

func SetupPsychologistRoutes(r *gin.Engine) {
	// Auth routes
	r.POST("/psychologists/register", psyauth.Register)
	r.POST("/psychologists/login", psyauth.Login)

	// User routes
	r.GET("/psychologists", psyuser.ListPsychologists)
	r.GET("/psychologists/:id", psyuser.GetPsychologistByID)
	r.PATCH("/psychologists/:id", psyuser.UpdatePsychologist)
	r.DELETE("/psychologists/:id", psyuser.DeletePsychologist)
}
