package entity

import (
  "gorm.io/gorm"
)

type FeedbackType struct {
  gorm.Model
  FeedbackTypeName string

  Feedback  []Feedback `gorm:"foreignKey:FeedbackTypeID"`

}