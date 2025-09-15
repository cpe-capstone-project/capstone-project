package routers

import (
	"capstone-project/controller/emotion"
	// "capstone-project/controller/emotion_analysis_results"
	"github.com/gin-gonic/gin"
)
func SetupEmmotionRoutes(r *gin.Engine) {
	r.GET("/emotion/:id", emotion.GetEmotionByID)
	r.GET("/emotion", emotion.GetAllEmotions)
	// r.GET("/psychologists", psyuser.ListPsychologists)
	r.GET("/emotion-analysis/:id", emotion.GetEmotionAnalysisByID)
	r.PATCH("/emotion-analysis/:id", emotion.UpdateEmotionAnalysis)
	r.DELETE("/emotion-analysis/:id", emotion.DeleteEmotionAnalysis)
	r.POST("/emotion-analysis", emotion.CreateEmotionAnalysis)
	// r.POST("/emotion-analysis/ai", emotion.CreateEmotionAnalysisWithAI)
	// r.POST("/emotion-analysis/analyze-only", emotion.AnalyzeEmotionOnly)

	// Flow สมบูรณ์ (Step 1-4)
    r.POST("/emotion-analysis-create-diary/:id", emotion.CreateEmotionAnalysisFromDiary)
    
	r.POST("/emotion-analysis-create-thoughtrecord/:id", emotion.CreateEmotionAnalysisFromThoughtRecord)
	
    // Helper endpoints
    r.GET("/emotion-analysis/:id/sub-emotions", emotion.GetSubEmotionAnalysis)
    r.GET("/emotion-analysis/:id/complete", emotion.GetCompleteEmotionAnalysis)
    // r.POST("/emotion-analysis/clean-text-test", emotion.TestCleanText)

	r.GET("/patientslist/dashboard_by_psychologist_id/:id", emotion.GetPatientsListDashboard)
	
	r.GET("/patientslist/dashboard/:id", emotion.GetPatientsDashboardByID)
	r.GET("/emotion/detailsdashboard_1/:id/:mode/:date", emotion.GetDashboardDetails_1ByID )
	r.GET("/emotion/detailsdashboard_2/:id/:stardate/:enddate", emotion.GetEmotionDetailsDashBoardByIDAndTime_2)
	r.GET("/emotion/detailsdashboard_3/:id/:stardate/:enddate", emotion.GetEmotionDetailsPrimaryEmoDashBoardByIDandTime)

	r.GET("/emotion/detailsdashboard_4/:id/:stardate/:enddate", emotion.GetEmotionDetailsSubWeekDashBoardByIDandTime)
}
