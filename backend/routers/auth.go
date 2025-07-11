package routers

import (
	"capstone-project/controller/psychology"
	"capstone-project/controller/patient"
	"github.com/gin-gonic/gin"
)

func SetupAuthenticationRoutes(r *gin.Engine) {
	r.POST("/signin", patient.SignIn)
	r.POST("/signup", patient.SignUp)
	r.POST("/patient/reset-password", patient.ResetPassword)
	// r.POST("/signupEm", patient.SignUpEmployee)
  r.POST("/psychologists/signin", psychologist.Login)
  r.POST("/psychologists/signup", psychologist.Register)
}
