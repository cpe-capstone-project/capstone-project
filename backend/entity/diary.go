package entity

import (
	"time"
	"gorm.io/gorm"
)

type Diaries struct {
	gorm.Model
	Title        string
	Content      string
	UpdatedAt    time.Time
	Confirmed    bool

	// จำกัดแค่ 3 สี
	TagColor1    string
	TagColor2    string
	TagColor3    string
	
	TherapyCaseID uint
	TherapyCase   *TherapyCase `gorm:"foreignKey:TherapyCaseID"`

	// many-to-many relationship
	Summaries     []DiarySummary  `gorm:"many2many:diary_summary_entries;joinForeignKey:DiaryID;joinReferences:DiarySummaryID"`

	// One-to-many relationship
	FeedbackDiary []FeedbackDiary `gorm:"foreignKey:DiaryID"`
}
