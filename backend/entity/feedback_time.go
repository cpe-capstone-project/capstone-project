package entity

import (
  "gorm.io/gorm"
)

type FeedbackTime struct {
  gorm.Model
  FeedbackTimeName string


  Feedback  []Feedback `gorm:"foreignKey:FeedbackTimeID"`
}