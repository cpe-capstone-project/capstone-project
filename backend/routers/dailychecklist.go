package routers

import (
	"capstone-project/controller/dailychecklist"
	"capstone-project/middlewares"
	"github.com/gin-gonic/gin"
)

func SetupChecklistRoutes(r *gin.Engine) {
	api := r.Group("/api")
	api.Use(middlewares.Authorizes()) 

	api.GET("/patients/:id/checklists", dailychecklist.GetChecklist)
	api.PATCH("/patients/:id/checklists/:date/toggle", dailychecklist.ToggleChecklist)
	api.PUT("/patients/:id/checklists/:date", dailychecklist.PutChecklist)
	api.GET("/patients/:id/checklists/range", dailychecklist.GetChecklistRange)
}
func SetupChecklistRoutesGroup(g *gin.RouterGroup) {
	api := g.Group("/api")
	api.GET("/patients/:id/checklists", dailychecklist.GetChecklist)
	api.PATCH("/patients/:id/checklists/:date/toggle", dailychecklist.ToggleChecklist)
	api.PUT("/patients/:id/checklists/:date", dailychecklist.PutChecklist)
	api.GET("/patients/:id/checklists/range", dailychecklist.GetChecklistRange)
}
