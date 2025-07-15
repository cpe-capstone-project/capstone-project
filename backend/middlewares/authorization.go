
// Authorization เป็นฟังก์ชั่นตรวจเช็ค Cookie

package middlewares


import (
   "fmt"
   "net/http"
   "strings"
   "capstone-project/services"
   "github.com/gin-gonic/gin"

)


var HashKey = []byte("very-secret")

var BlockKey = []byte("a-lot-secret1234")


// Authorization เป็นฟังก์ชั่นตรวจเช็ค Cookie

func Authorizes(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientToken := c.GetHeader("Authorization") // ดึง Authorization Header
		if clientToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "No Authorization header provided"})
			return
		}

		// แยก Bearer ออกจาก Token
		if !strings.HasPrefix(clientToken, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Incorrect Format of Authorization Token"})
			return
		}

		clientToken = strings.TrimPrefix(clientToken, "Bearer ")
		clientToken = strings.TrimSpace(clientToken) // ตัดช่องว่างที่ไม่จำเป็น

		// Validate Token
		jwtWrapper := services.JwtWrapper{
			SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
			Issuer:    "AuthService",
		}

		claims, err := jwtWrapper.ValidateToken(clientToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// Debug Log สำหรับตรวจสอบค่า Claims
		fmt.Printf("Debug - Email: %s, Role: %s\n", claims.Email, claims.Role)
		fmt.Println("👉 Claims from token:", claims)
		fmt.Printf("✅ Extracted Email: '%s'\n", claims.Email)


		// เซ็ตข้อมูลลง Context
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		// ตรวจสอบ Role หากจำเป็น
		if len(allowedRoles) > 0 {
			isAllowed := false
			for _, role := range allowedRoles {
				if role == claims.Role {
					isAllowed = true
					break
				}
			}
			if !isAllowed {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "You are not allowed to access this resource"})
				return
			}
		}

		c.Next()
	}
}
// func CORSMiddleware() gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		origin := c.Request.Header.Get("Origin")
// 		// กำหนด Allow-Origin แบบยืดหยุ่น
// 		if origin == "http://localhost:3000" || origin == "http://localhost:5173" || origin == "http://localhost:4242"{
// 			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
// 		}

// 		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
// 		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, accept, origin")
// 		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")

// 		if c.Request.Method == "OPTIONS" {
// 			c.AbortWithStatus(204)
// 			return
// 		}

// 		c.Next()
// 	}
// }

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")


		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()

	}

}