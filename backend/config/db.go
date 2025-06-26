package config

import (
	"fmt"
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"capstone-project/entity" // ตรวจสอบว่า path นี้ถูกต้องตามโปรเจกต์คุณ
)

var db *gorm.DB

// Getter ฟังก์ชันเพื่อให้ controller อื่นเรียกใช้งาน DB ได้
func DB() *gorm.DB {
	return db
}

// เชื่อมต่อฐานข้อมูล capstone-project.db
func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("capstone-project.db?cache=shared"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}
	fmt.Println("connected database")

	db = database

	// ทำ AutoMigrate ตารางในฐานข้อมูล
	err = db.AutoMigrate(
		&entity.Patient{},
		&entity.Psychologist{},
		// เพิ่ม entity อื่น ๆ ได้ที่นี่ เช่น &entity.Diary{}, &entity.Appointment{} เป็นต้น
	)
	if err != nil {
		log.Fatal("failed to migrate database:", err)
	}
}

// เตรียมข้อมูลเริ่มต้น (ถ้ามี)
func SetupDatabase() {
	SetupDiaryDatabase()

	fmt.Println("Sample data has been added to the database.")
}
