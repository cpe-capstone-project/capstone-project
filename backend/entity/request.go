package entity

import (
	"time"

	"gorm.io/gorm"
)

type Request struct {
	gorm.Model

	Type         string     `json:"type"`
	Detail       string     `json:"detail" gorm:"type:text"`
	Other        *string    `json:"other" gorm:"type:text"`       // optional
	MeetingStart *time.Time `json:"meeting_start"`                // RFC3339 ok
	MeetingEnd   *time.Time `json:"meeting_end"`                  // RFC3339 ok

	PatientID      uint        `json:"patient_id" gorm:"index"`
	Patient        *Patients   `json:"patient" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	PsychologistID uint          `json:"psychologist_id" gorm:"index"`
	Psychologist   *Psychologist `json:"psychologist" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}
