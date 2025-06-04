package config

import (
	"fmt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
   database, err := gorm.Open(sqlite.Open("capstone-project.db?cache=shared"), &gorm.Config{})
   if err != nil {
       panic("failed to connect databaase")
   }
   fmt.Println("connected database")
   db = database
}

func SetupDatabase() {
	SetupDiaryDatabase()
	
	fmt.Println("Sample data has been added to the database.")
}