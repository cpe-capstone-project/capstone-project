package routers

import (
	"capstone-project/controller/patient"
	"capstone-project/middlewares"
	"net/http"

	"github.com/gin-gonic/gin"
)

const PORT = "8000"

// SetupRouter initializes the router
func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// Public Routes
	SetupAuthenticationRoutes(r)
	SetupPsychologistRoutes(r)
	// Private Routes (Require Authorization)
	private := r.Group("/")
	private.Use(middlewares.Authorizes())
	SetupDiaryRoutes(private)
	
	// ✅ ย้าย route นี้มาอยู่ตรงนี้
	r.GET("/patient/profile", middlewares.Authorizes(), patient.GetProfile)

	private.PUT("/patient/update-profile", patient.UpdateProfile)
	// Root Route
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	return r
}
