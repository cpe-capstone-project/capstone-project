package entity

import (
  "time"
  "gorm.io/gorm"
)

type Patients struct {
  gorm.Model
  FirstName       string
  LastName        string
  Email           string
  Phone           string
  Age             uint8
  BirthDay        time.Time
  Password        string
  Image           string
  Consent         bool
  Address         string
  GenderID        uint
  Gender          *Genders
  RoleID          uint
  Role            *Roles
  PsychologistID uint
  Psychologist   *Psychologist `gorm:"foreignKey:PsychologistID"`
  Requests    []Request    `gorm:"foreignKey:PatientID"`
  DailyChecklists []DailyChecklist `gorm:"foreignKey:PatientID"`
  TherapyCase  []TherapyCase `gorm:"foreignKey:PatientID"`
}
