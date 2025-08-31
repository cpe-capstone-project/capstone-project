package entity

import (
	"gorm.io/gorm"

)

type FeedbackDiary struct {
	gorm.Model

	DiaryID uint
	Diary  *Diaries `gorm:"foreignKey:DiaryID"`

	FeedbackID uint
	Feedbacks   *Feedbacks `gorm:"foreignKey:FeedbackID"`


}
