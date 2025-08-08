package routers

import (
	"capstone-project/controller/diary"
	"github.com/gin-gonic/gin"
)

func SetupDiaryRoutes(r *gin.RouterGroup) {

	r.GET("/diary-summary/:id", diary.GetDiarySummaryByID)
	r.POST("/diary-summary", diary.SummarizeDiaries)

	r.GET("/diaries", diary.ListDiaries)
	r.GET("/diaries/latest", diary.ListLatestDiaries)
	r.GET("/diary/:id", diary.GetDiaryByID)
	r.POST("/diary", diary.CreateDiary)
	r.PATCH("/diary/:id", diary.UpdateDiaryByID)
	r.DELETE("/diary/:id", diary.DeleteDiary)
	r.GET("/diaries/count", diary.CountDiariesByMonth)
	r.GET("/diaries/home", diary.GetHomeDiaries)

}