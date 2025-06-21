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
	TherapyCaseID	uint
	// TherapyCase		*TherapyCases 	`gorm:"foreignKey:TherapyCaseID"`
}
