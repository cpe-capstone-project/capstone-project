package entity

import (
  "gorm.io/gorm"
  "time"
)

type FeedbackType struct {
  gorm.Model
  FeedbackName string
  FeedbackStartDate     time.Time
  FeedbackEndDate     time.Time
}