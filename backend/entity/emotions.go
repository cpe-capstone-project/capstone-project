package entity

import "gorm.io/gorm"

type Emotions struct {
	gorm.Model
	Emotionsname      string
	Category          string
	ThaiEmotionsname  string
	EmotionsColor     string

	ThoughtRecords []ThoughtRecord `gorm:"many2many:thoughtrecord_emotions;"` // many-to-many
}
