package entity

import (
	"time"
	"gorm.io/gorm"
)

type EmotionAnalysisResults struct {
	gorm.Model
	InputText 			string
	TranslatedText string
	AnalysisTimestamp	time.Time
	Modelversion	string
	PrimaryEmotion string
	DiaryID uint     `json:"diary_id" gorm:"not null"`
    Diary   *Diaries `json:"diary" gorm:"foreignKey:DiaryID;references:ID"`
	ThoughtRecordID uint
	ThoughtRecord   *ThoughtRecord `gorm:"foreignKey:ThoughtRecordID"`
	PatientID uint
  	Patient   Patients `gorm:"foreignKey:PatientID"`
}