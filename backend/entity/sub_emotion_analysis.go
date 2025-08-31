package entity

import (
	"gorm.io/gorm"
)

type SubEmotionAnalysis struct {
	gorm.Model
	ConfidencePercentage	float64
	Score	float64
	EmotionAnalysisResultsID uint
	EmotionAnalysisResults   *EmotionAnalysisResults `gorm:"foreignKey:EmotionAnalysisResultsID"`
	EmotionsID  	uint      	
    Emotions    	*Emotions  	`gorm:"foreignKey: emotions_id" json:"emotions"`
}