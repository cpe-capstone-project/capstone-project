package entity

import (
  "gorm.io/gorm"
)

type FeedbackTime struct {
  gorm.Model
  FeedbackTimeName string


  Feedbacks  []Feedbacks `gorm:"foreignKey:FeedbackTimeID"`
}