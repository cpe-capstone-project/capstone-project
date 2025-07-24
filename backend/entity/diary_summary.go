package entity

import (
	"time"
	"gorm.io/gorm"
)

type DiarySummary struct {
	gorm.Model
	Timeframe     	string    // เช่น "Weekly", "Monthly"
	StartDate     	time.Time
	EndDate       	time.Time
	SummaryText   	string
	
	TherapyCaseID 	uint
	TherapyCase 	*TherapyCase `gorm:"foreignKey:TherapyCaseID"`

	Diaries 		[]Diaries `gorm:"many2many:diary_summary_entries;joinForeignKey:DiarySummaryID;joinReferences:DiaryID"`
}