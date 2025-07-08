package entity

import (
	"gorm.io/gorm"
)

type Emotions struct {
	gorm.Model
	Emotionsname			string
	Category		string

	// EmotionAnalysisResults []EmotionAnalysisResults `gorm:"foreignKey:EmotionAnalysisResultsID"`
}