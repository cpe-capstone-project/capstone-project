package routers

import (
	"capstone-project/controller/feedback"
	"github.com/gin-gonic/gin"
)

func SetupFeedbackRoutes(r *gin.RouterGroup) {

	r.POST("/feedback/create", feedback.CreateFeedback)
	r.GET("/feedback-time", feedback.GetFeedbackTime)
	r.GET("/feedback/diary/:id", feedback.GetFeedbackByDiaryID)
	r.GET("/feedback/thought/:id", feedback.GetFeedbackByThoughtID)

	r.GET("/patient/feedback/diary/:patient_id", feedback.GetDiaryFeedbackByPatient)
	r.GET("/patient/feedback/thought/:patient_id", feedback.GetThoughtFeedbackByPatient)

	r.GET("/patient/:patientId/feedbacks", feedback.GetFeedbacksByPatient)
	r.GET("/diaries/:diaryId/feedbacks", feedback.GetFeedbacksByDiary)

}

