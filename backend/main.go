package main

import "capstone-project/config"

func main() {
	// เปิดการเชื่อมต่อฐานข้อมูล
	config.ConnectionDB()

	// สร้างฐานข้อมูล
	config.SetupDatabase()
	
	// r.Run("localhost:" + routers.PORT)
}
