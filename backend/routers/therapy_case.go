package routers

import (
	"capstone-project/controller/therapy_case"
	"github.com/gin-gonic/gin"
)

func SetupTherapyCaseRoutes(r *gin.RouterGroup) {

	r.GET("/therapy-case/patient/:id", therapy_case.GetTherapyCaseByPatientID)
	r.GET("/therapy-case/psyco/:id", therapy_case.GetTherapyCasesByPsychologistID)
	r.GET("/patientbypsycoID/:id", therapy_case.GetPatientByPsychologistID)
	r.GET("/therapy-case/:id", therapy_case.GetTherapyCasesByID)
	r.POST("/therapy-case/create", therapy_case.CreateTherapyCase)
	r.PATCH("/therapy-case/update/:id", therapy_case.UpdateTherapyCase)
	r.DELETE("/therapy-case/delete/:id", therapy_case.DeleteTherapyCase)
}

