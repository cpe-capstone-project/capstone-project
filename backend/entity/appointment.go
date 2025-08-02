package entity

import (
	"time"
	"gorm.io/gorm"
)

type Appointment struct {
	gorm.Model
	Title          string      `json:"title"`
	Detail         string      `json:"detail"` 
	StartTime      time.Time   `json:"start"`
	EndTime        time.Time   `json:"end"`
	PsychologistID uint        `json:"psychologist_id"`
	Psychologist   *Psychologist
	PatientID      uint
	Patient        *Patients
	Status         string      `json:"status" gorm:"default:'pending'"`
	Reason         string      `json:"reason"`
}

