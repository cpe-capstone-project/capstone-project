package entity

import (
	"time"
	"gorm.io/gorm"
)

type EmotionAnalysisResults struct {
	gorm.Model
	InputText 			string
	AnalysisTimestamp	time.Time
	Modelversion	string
	SentimentScore	uint8
	DiaryID uint     `json:"diary_id" gorm:"not null"`
    Diary   *Diaries `json:"diary" gorm:"foreignKey:DiaryID;references:ID"`
	// ThoughtrecordID  	uint      	//`valid:"required~EmotionsID is required"`
    // Thoughtrecord    	*Thoughtrecord  	`gorm:"foreignKey: thoughtrecord_id" json:"thoughtrecord"`
	EmotionsID  	uint      	//`valid:"required~EmotionsID is required"`
    Emotions    	*Emotions  	`gorm:"foreignKey: emotions_id" json:"emotions"`
}