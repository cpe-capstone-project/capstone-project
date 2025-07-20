package admin

import (
	"capstone-project/config"
	"capstone-project/entity"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var wsClients = make(map[string]*websocket.Conn)
var wsLock = sync.Mutex{}

type ApproveRequest struct {
	Email string `json:"email"`
}

func generateRandomPIN() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000)) // เช่น "529173"
}
// ✅ WebSocket ที่เชื่อมจาก frontend เพื่อรอฟังการอนุมัติ
func ApproveWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		var data ApproveRequest
		if err := json.Unmarshal(msg, &data); err != nil {
			continue
		}

		wsLock.Lock()
		wsClients[data.Email] = conn
		wsLock.Unlock()
	}
}
// ✅ ฟังก์ชันกดอนุมัติจาก Admin Dashboard
func ApprovePsychologist(c *gin.Context) {
	id := c.Param("id")
	var psychologist entity.PendingPsychologist

	db := config.DB() // ✅ แก้ตรงนี้

	if err := db.First(&psychologist, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ใช้นี้"})
		return
	}
	// ✅ สุ่ม PIN และ hash
	pin := generateRandomPIN()
	hashedPIN, err := config.HashPassword(pin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hash failed"})
		return
	}
	psychologistApproved := entity.Psychologist{
		FirstName:      psychologist.FirstName,
		LastName:       psychologist.LastName,
		Age:            psychologist.Age,
		GenderID:       psychologist.GenderID,
		DOB:            psychologist.DOB,
		Phone:          psychologist.Phone,
		MedicalLicense: psychologist.MedicalLicense,
		Email:          psychologist.Email,
		PasswordHash:   psychologist.PasswordHash,
		LicenseImage:   psychologist.LicenseImage,
		RoleID:         psychologist.RoleID,
		VerifyCodeHash: hashedPIN,
	}

	db.Create(&psychologistApproved)
	db.Delete(&psychologist)

	// ✅ ส่ง WebSocket กลับพร้อม PIN จริง
	wsLock.Lock()
	if conn, ok := wsClients[psychologist.Email]; ok {
		conn.WriteJSON(gin.H{
			"status":      "approved",
			"verify_code": pin, // <== ส่งรหัสจริง
		})
		conn.Close()
		delete(wsClients, psychologist.Email)
	}
	wsLock.Unlock()

	c.JSON(http.StatusOK, gin.H{"message": "อนุมัติเรียบร้อยแล้ว"})
}