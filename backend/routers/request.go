package routers

import (
	reqctl "capstone-project/controller/request"
	"capstone-project/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRequestRoutes(r *gin.Engine) {
	// group ภายใต้ /requests
	req := r.Group("/requests")

	// ต้องผ่าน middleware ตรวจ token
	req.Use(middlewares.Authorizes())
	{
		// POST /requests
		req.POST("", reqctl.CreateRequest)

		// GET /requests/by-psychologist?psychologist_id=1
		req.GET("/by-psychologist", reqctl.GetRequestsByPsych)
	}
}
