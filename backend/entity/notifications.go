package entity

import (
	"time"
	"gorm.io/gorm"
)

type Notifications struct {
	gorm.Model
	Message 			string
	Sentat	time.Time
	NotificationType	string
	Seen	bool
	FeedbackID uint     //`json:"feedback_id" gorm:"not null"`
    Feedback   *Diaries `json:"feedback" gorm:"foreignKey:FeedbackID;references:ID"`
	PatientID uint
  	Patients   *Patients `gorm:"foreignKey:PatientID"`
	PsychologistID uint
  	Psychologist   *Psychologist `gorm:"foreignKey:PsychologistID"`
	DiaryID uint     `json:"diary_id" gorm:"not null"`
    Diary   *Diaries `json:"diary" gorm:"foreignKey:DiaryID;references:ID"`
	EmotionAnalysisResultsID uint
  	EmotionAnalysisResults   *EmotionAnalysisResults `gorm:"foreignKey:EmotionAnalysisResultsID"`
}