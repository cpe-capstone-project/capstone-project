package entity

import (
  "gorm.io/gorm"
  "time"
)

type TherapyCase struct {
  gorm.Model
  CaseTitle string
  CaseDescription string
  CaseStartDate     time.Time

  CaseStatusID uint
  CaseStatus   *CaseStatus `gorm:"foreignKey:CaseStatusID"`

  PsychologistID uint
  Psychologist   *Psychologist `gorm:"foreignKey:PsychologistID"`

  PatientID uint
  Patients   *Patients `gorm:"foreignKey:PatientID"`
}