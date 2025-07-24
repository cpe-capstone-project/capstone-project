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
	UpdatedAt        time.Time
	TherapyCaseID    uint
	EmotionsID       uint

	// Relation to Feedbacks
	Feedbacks []Feedback `gorm:"foreignKey:ThoughtRecID"`
	TherapyCase TherapyCase `gorm:"foreignKey:TherapyCaseID"`     // many-to-one
}
