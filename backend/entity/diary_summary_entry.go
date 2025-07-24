package entity

import (
	"gorm.io/gorm"
)

type DiarySummaryEntry struct {
	gorm.Model
	
	DiaryID uint
	Diary   *Diaries `gorm:"foreignKey:DiaryID"`

	DiarySummaryID uint
	DiarySummary   *DiarySummary `gorm:"foreignKey:DiarySummaryID"`
}
