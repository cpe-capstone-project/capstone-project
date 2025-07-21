package entity

import (
  "gorm.io/gorm"
)

type CaseStatus struct {
  gorm.Model
  StatusName string

  TherapyCases  []TherapyCase `gorm:"foreignKey:CaseStatusID"`
}