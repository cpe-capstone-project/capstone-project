package entity

import (
	"gorm.io/gorm"
	"time"
)

type Feedbacks struct {
	gorm.Model
	FeedbackTitle   string
	FeedbackContent string
	FeedbackStartDate     time.Time
  	FeedbackEndDate     time.Time

	ThoughtRecordID uint
	ThoughtRecord   *ThoughtRecord `gorm:"foreignKey:ThoughtRecordID"`

	PsychologistID uint
	Psychologist   *Psychologist `gorm:"foreignKey:PsychologistID"`

	PatientID uint
	Patient   *Patients `gorm:"foreignKey:PatientID"`


	FeedbackTypeID uint
	FeedbackType   *FeedbackType `gorm:"foreignKey:FeedbackTypeID"`

	FeedbackTimeID uint
	FeedbackTime   *FeedbackTime `gorm:"foreignKey:FeedbackTimeID"`

	FeedbackDiary []FeedbackDiary `gorm:"foreignKey:FeedbackID;"`

}
