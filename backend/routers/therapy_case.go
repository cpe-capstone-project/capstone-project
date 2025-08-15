package routers

import (
	"capstone-project/controller/therapy_case"
	"github.com/gin-gonic/gin"
)

func SetupTherapyCaseRoutes(r *gin.RouterGroup) {

	r.GET("/therapy-case/patient/:id", therapy_case.GetTherapyCaseByPatientID)
}

