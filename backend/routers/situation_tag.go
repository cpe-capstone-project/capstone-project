package routers

import (
	"capstone-project/controller/situation_tag"
	"github.com/gin-gonic/gin"
)

func SetupSituationTagRoutes(r *gin.RouterGroup) {
    r.GET("/situation-tags", situation_tag.ListSituationTags)
    r.POST("/situation-tags", situation_tag.CreateSituationTag)
    r.DELETE("/situation-tags/:id", situation_tag.DeleteSituationTag)
}
