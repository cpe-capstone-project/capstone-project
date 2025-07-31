package entity

import (
	"time"
	"gorm.io/gorm"
)

type Diaries struct {
	gorm.Model
	Title 			string
	Content 		string
	UpdatedAt		time.Time
	TagColors     	string
	Confirmed 		bool

	TherapyCaseID	uint
	TherapyCase		*TherapyCase 	`gorm:"foreignKey:TherapyCaseID"`

	Summaries 		[]DiarySummary `gorm:"many2many:diary_summary_entries;joinForeignKey:DiaryID;joinReferences:DiarySummaryID"`
}
