package entity

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type DailyChecklist struct {
	gorm.Model

	PatientID uint       `gorm:"index;not null;uniqueIndex:ux_patient_date"`        
	Patient   *Patients  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Date     time.Time `gorm:"type:date;not null;uniqueIndex:ux_patient_date"`         
	Timezone string    `gorm:"size:64;default:'Asia/Bangkok'"`                        
	Tasks datatypes.JSONMap `gorm:"type:json;not null"`   
	Done  datatypes.JSONMap `gorm:"type:json;not null"`  


	Version uint `gorm:"default:1"`
}
