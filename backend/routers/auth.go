package routers

import (
	"capstone-project/controller/patient"
	"github.com/gin-gonic/gin"
)

func SetupAuthenticationRoutes(r *gin.Engine) {
	r.POST("/signin", patient.SignIn)
	r.POST("/signup", patient.SignUp)
	// r.POST("/signupEm", patient.SignUpEmployee)
}
