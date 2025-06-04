package main

import (
	"capstone-project/config"
	"capstone-project/routers"
)

func main() {
	// เปิดการเชื่อมต่อฐานข้อมูล
	config.ConnectionDB()

	// สร้างฐานข้อมูล
	config.SetupDatabase()

	// เรียกใช้ Router จาก package routers
	r := routers.SetupRouter()

	// เริ่มต้น server
	r.Run("localhost:" + routers.PORT)
}
