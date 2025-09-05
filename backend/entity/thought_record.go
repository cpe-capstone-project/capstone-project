package entity

import (
	"time"

	"gorm.io/gorm"
)

type ThoughtRecord struct {
	gorm.Model
	Situation        string
	Thoughts         string
	Behaviors        string
	AlternateThought string
	TagColors        string
	UpdatedAt        time.Time

	// FK
	TherapyCaseID uint

	// Relations
	Feedback    []Feedbacks  `gorm:"foreignKey:ThoughtRecordID"`
	TherapyCase *TherapyCase `gorm:"foreignKey:TherapyCaseID"`
	Emotions    []Emotions   `gorm:"many2many:thoughtrecord_emotions;"` // many-to-many
}
