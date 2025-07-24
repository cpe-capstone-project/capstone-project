package entity

import (
	"time"
	"gorm.io/gorm"
)

type ThoughtRecordSummary struct {
	gorm.Model
	TherapyCaseID uint
	Timeframe     string    // เช่น "Weekly", "Monthly"
	StartDate     time.Time
	EndDate       time.Time
	SummaryText   string

	// TherapyCase *TherapyCase `gorm:"foreignKey:TherapyCaseID"`
}