package entity

import (
	"gorm.io/gorm"
)

type Feedback struct {
	gorm.Model
	FeedbackTitle   string
	FeedbackContent string

	PsychologistID uint
	Psychologist   *Psychologist `gorm:"foreignKey:PsychologistID"`

	DiaryID uint     `json:"diary_id" gorm:"not null"`
	Diary   *Diaries `json:"diary" gorm:"foreignKey:DiaryID;references:ID"`

	FeedbackTypeID uint
	FeedbackType   *FeedbackType `gorm:"foreignKey:FeedbackTypeID"`
}
