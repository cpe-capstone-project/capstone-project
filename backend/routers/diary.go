package routers

import (
	"capstone-project/controller/diary"
	"github.com/gin-gonic/gin"
)

func SetupDiaryRoutes(r *gin.RouterGroup) {

	r.POST("/diary/summary", diary.GenerateDiarySummary)

	r.GET("/diaries", diary.ListDiaries)
	r.GET("/diary/:id", diary.GetDiaryByID)
	r.POST("/diary", diary.CreateDiary)
	r.PATCH("/diary/:id", diary.UpdateDiaryByID)
	r.DELETE("/diary/:id", diary.DeleteDiary)
}