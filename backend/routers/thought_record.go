package routers

import (
	"capstone-project/controller/thought_record"
	"github.com/gin-gonic/gin"
)

func SetupThoughtRecordRoutes(r *gin.RouterGroup) {

	// Routes for ThoughtRecord
	r.GET("/thought_record/patient/:patientId/therapy-case/:caseId", thought_record.ListThoughtRecord)
	r.GET("/thought_record/:id", thought_record.GetThoughtRecordByID)
	r.GET("/thoughtrecords/case/:id", thought_record.GetThoughtRecordsByTherapyCaseID)
	r.POST("/thought_record", thought_record.CreateThoughtRecord)
	r.PATCH("/thought_record/:id", thought_record.UpdateThoughtRecordByID)
	r.DELETE("/thought_record/:id", thought_record.DeleteThoughtRecord)
	r.GET("/patients/:patientId/thought-records", thought_record.GetLatestThoughtRecordsByPatientID)
    r.GET("/patients/:patientId/thought-records/count", thought_record.GetThoughtRecordCountByPatientID)
}
	// Optional: ถ้ายังต้องการดึง Diaries ล่าสุดที่ใช้ใน Dashboard
	// r.GET("/diaries/latest", thought_record.ListLatestDiaries)
