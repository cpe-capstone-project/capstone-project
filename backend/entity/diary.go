package entity

import (
	"time"
	"gorm.io/gorm"
)

type Diaries struct {
	gorm.Model
	Title        string    `valid:"required~Title is required"`
	Content      string    `valid:"required~Content is required"`
	UpdatedAt    time.Time `valid:"required~UpdatedAt is required"`
	Confirmed    bool      `valid:"-"`

	TagColor1    string    `valid:"hexcolor~TagColor1 must be a valid hex color"`
	TagColor2    string    `valid:"hexcolor~TagColor2 must be a valid hex color"`
	TagColor3    string    `valid:"hexcolor~TagColor3 must be a valid hex color"`

	TherapyCaseID uint         `valid:"required~TherapyCaseID is required"`
	TherapyCase   *TherapyCase `gorm:"foreignKey:TherapyCaseID" valid:"-"`

	Summaries     []DiarySummary  `gorm:"many2many:diary_summary_entries;joinForeignKey:DiaryID;joinReferences:DiarySummaryID" valid:"-"`
	FeedbackDiary []FeedbackDiary `gorm:"foreignKey:DiaryID" valid:"-"`
}
