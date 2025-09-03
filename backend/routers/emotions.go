package routers

import (
	"capstone-project/controller/emotions"
	"github.com/gin-gonic/gin"
)

func SetupEmotionsRoutes(r *gin.RouterGroup) {

	// Routes for ThoughtRecord
	r.GET("/emotions", emotions.GetAllEmotions)
}
