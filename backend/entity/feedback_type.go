package entity

import (
  "gorm.io/gorm"
)

type FeedbackType struct {
  gorm.Model
  FeedbackTypeName string

  Feedbacks []Feedbacks `gorm:"foreignKey:FeedbackTypeID"`

}