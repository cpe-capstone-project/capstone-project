package routers

import (
	"net/http"
	"capstone-project/middlewares"

	"github.com/gin-gonic/gin"
)

const PORT = "8000"

// SetupRouter initializes the router
func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// Public Routes
	// setupAuthRoutes(r)
	// setupGuestAuthRoutes(r)

	// Private Routes (Require Authorization)
	private := r.Group("/")
	// private.Use(middlewares.Authorizes())

	setupAuthRoutes(private)


	// Public Route for Genders
	// r.GET("/genders", genders.GetAll)

	// Root Route
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	return r
}