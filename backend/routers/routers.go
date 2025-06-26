package routers

import (
	"net/http"
	"capstone-project/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8000"

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// ✅ ตรงกันแล้ว เพราะส่ง *gin.Engine
	SetuploginRoutes(r)

	private := r.Group("/")
	private.Use(middlewares.Authorizes())
	SetupDiaryRoutes(private)

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	return r
}
