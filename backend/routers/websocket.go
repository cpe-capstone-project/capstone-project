package routers

import (
	"capstone-project/controller/ws"
	"github.com/gin-gonic/gin"
)

func SetupWebSocketRoute(r *gin.Engine) {
	r.GET("/ws/:userID", func(c *gin.Context) {
		userID := c.Param("userID")
		ws.ServeWs(c.Writer, c.Request, userID)
	})
}
