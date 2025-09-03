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
	EmotionsID    uint

	// Relations
	Feedback    []Feedbacks  `gorm:"foreignKey:ThoughtRecordID"`
	TherapyCase TherapyCase  `gorm:"foreignKey:TherapyCaseID"` // many-to-one
	Emotion     Emotions     `gorm:"foreignKey:EmotionsID"`    // many-to-one (1 TR -> 1 Emotion)
}
