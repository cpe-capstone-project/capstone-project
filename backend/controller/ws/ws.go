package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Client แทนผู้ใช้งานที่เชื่อมต่อผ่าน WebSocket
type Client struct {
	Conn *websocket.Conn
	UserID string
}

// Hub คือศูนย์กลางของ WebSocket connections
type Hub struct {
	clients map[string]*Client // map[UserID]Client
	mu      sync.RWMutex
}

// สร้าง GlobalHub ใช้งานทั่วระบบ
var GlobalHub = &Hub{
	clients: make(map[string]*Client),
}

// เพิ่ม client ใหม่
func (h *Hub) AddClient(userID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[userID] = &Client{
		Conn:   conn,
		UserID: userID,
	}
	log.Printf("✅ Connected WebSocket: %s | All Clients: %v\n", userID, h.clients)
}


// ลบ client
func (h *Hub) RemoveClient(userID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if client, ok := h.clients[userID]; ok {
		client.Conn.Close()
		delete(h.clients, userID)
		log.Printf("❌ Disconnected WebSocket: %s\n", userID)
	}
}

func (h *Hub) SendToUser(userID string, message interface{}) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if client, ok := h.clients[userID]; ok {
		data, err := json.Marshal(message)
		if err != nil {
			log.Println("❌ Marshal Error:", err)
			return
		}
		log.Println("📨 Sending message to", userID, "=>", string(data))
		client.Conn.WriteMessage(websocket.TextMessage, data)
	} else {
		log.Println("⚠️ No active WebSocket for user:", userID)
	}
}
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // ✅ อนุญาตให้ทุก origin เชื่อมได้
	},
}

// ✅ ตัวนี้คือ Handler สำหรับ route /ws/:userID
func ServeWs(w http.ResponseWriter, r *http.Request, userID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("❌ WebSocket upgrade error:", err)
		return
	}

	GlobalHub.AddClient(userID, conn)
	defer GlobalHub.RemoveClient(userID)

	// ✅ รออ่าน (เพื่อไม่ให้ connection ตัด แม้จะไม่ใช้งาน input)
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}
}