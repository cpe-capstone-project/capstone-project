package routers

import (
	"capstone-project/controller/feedback"
	"github.com/gin-gonic/gin"
)

func SetupFeedbackRoutes(r *gin.RouterGroup) {

	r.POST("/feedback/create", feedback.CreateFeedback)
	r.GET("/feedback-time", feedback.GetFeedbackTime)
}

