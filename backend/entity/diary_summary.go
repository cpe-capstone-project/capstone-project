package entity

import (
	"time"
	"gorm.io/gorm"
)

type DiarySummary struct {
	gorm.Model
	Timeframe      string    `valid:"required~Timeframe is required"`
	StartDate      time.Time `valid:"required~StartDate is required"`
	EndDate        time.Time `valid:"required~EndDate is required"`
	SummaryText    string    `valid:"required~SummaryText is required"`
	Keyword        string    `valid:"required~Keyword is required"`
	
	TherapyCaseID  uint       `valid:"required~TherapyCaseID is required"`
	TherapyCase    *TherapyCase `gorm:"foreignKey:TherapyCaseID" valid:"-"`

	Diaries        []Diaries `gorm:"many2many:diary_summary_entries;joinForeignKey:DiarySummaryID;joinReferences:DiaryID" valid:"-"`
}
