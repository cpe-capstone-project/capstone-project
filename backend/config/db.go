package config

import (
    "fmt"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
)

// ตัวแปร db ใช้เก็บ instance ของ gorm.DB สำหรับเชื่อมต่อฐานข้อมูล
var db *gorm.DB

// DB คืนค่า instance ของ gorm.DB ที่ใช้ในโปรเจกต์
func DB() *gorm.DB {
    return db
}

// ConnectionDB ใช้สำหรับเชื่อมต่อกับฐานข้อมูล SQLite
// หากเชื่อมต่อไม่สำเร็จจะ panic ทันที
func ConnectionDB() {
   database, err := gorm.Open(sqlite.Open("capstone-project.db?cache=shared"), &gorm.Config{})
   if err != nil {
       panic("failed to connect database")
   }
   fmt.Println("connected database")
   db = database
}

// SetupDatabase ใช้สำหรับตั้งค่าฐานข้อมูลเบื้องต้น
// เช่น การสร้างตารางและเพิ่มข้อมูลตัวอย่าง
func SetupDatabase() {
    SetupPatientDatabase()
    SetupDiaryDatabase()
    SetupPsychologistDatabase() 
    SetupEmotionDatabase()
    SetupInitialData()
    SetupNotifications()
    SetupThoughtRecordDatabase()
    SetupFeedbackDatabase()
    SetupTherapyCaseDatabase()
    SetuprequestData() 
    SetupInitialChecklist()
    
    fmt.Println("Sample data has been added to the database.")
}