package config

import (
	"capstone-project/entity"
	"fmt"
	"time"
	"gorm.io/gorm"
)

func SetupThoughtRecordDatabase() {
	db := DB()
	db.AutoMigrate(
		&entity.ThoughtRecord{},
		&entity.Emotions{},
		&entity.SituationTag{},
	)

	// ตัวอย่าง ThoughtRecord
	record := []entity.ThoughtRecord{
		{
			Situation:        "วันที่รู้สึกโดดเดี่ยว",
			Thoughts:         "ไม่มีใครสนใจเราเลย เราไม่มีค่าเลยหรือเปล่า",
			Behaviors:        `"นั่งอยู่คนเดียว", "ไม่คุยกับใคร"`,
			AlternateThought: "แม้วันนี้จะรู้สึกเหงา แต่ก็เคยมีวันที่เรารู้สึกดีและมีเพื่อนพูดคุย อย่าเพิ่งด่วนสรุปว่าทุกคนไม่สนใจเรา",
			TagColors:        "#1890ff", // 🔵 ฟ้า
			UpdatedAt:        time.Now(),
			TherapyCaseID:    1,
			SituationTagID:   1,
			Emotions: []entity.Emotions{ // ตัวอย่างใส่หลายอารมณ์
				{Model: gorm.Model{ID: 24}},
				{Model: gorm.Model{ID: 18}},
			},
		},
	}

	for d := range record {
		db.FirstOrCreate(&record[d], entity.ThoughtRecord{Situation: record[d].Situation})
	}

	fmt.Println("Thought Record data has been added to the database.")
}