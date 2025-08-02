package config

import (
	"capstone-project/entity"
	"fmt"
	"time"
)

func SetupThoughtRecordDatabase() {
	db.AutoMigrate(
		&entity.ThoughtRecord{},
	)

	record := []entity.ThoughtRecord{
		{
			Situation:        "วันที่รู้สึกโดดเดี่ยว",
			Thoughts:         "ไม่มีใครสนใจเราเลย เราไม่มีค่าเลยหรือเปล่า",
			EmotionsID:       1, // เหงา
			Behaviors:        `"นั่งอยู่คนเดียว", "ไม่คุยกับใคร"`,
			AlternateThought: "แม้วันนี้จะรู้สึกเหงา แต่ก็เคยมีวันที่เรารู้สึกดีและมีเพื่อนพูดคุย อย่าเพิ่งด่วนสรุปว่าทุกคนไม่สนใจเรา",
			UpdatedAt:        time.Now(),
			TherapyCaseID:    1,
		},
		{
			Situation:        "วันทำงานที่มีปัญหากับเพื่อนร่วมงาน",
			Thoughts:         "เขาไม่ชอบเราแน่เลย เราคงทำอะไรผิดอีกแล้ว",
			EmotionsID:       2, // กังวล
			Behaviors:        `"หลีกเลี่ยงการคุย", "ไม่กล้าถามเรื่องงาน"`,
			AlternateThought: "อาจเป็นแค่ความเข้าใจผิด ลองคุยกันก่อนดีกว่า ไม่ใช่ทุกอย่างต้องเป็นความผิดเรา",
			UpdatedAt:        time.Now(),
			TherapyCaseID:    1,
		},
		{
			Situation:        "สอบได้คะแนนต่ำกว่าที่คาด",
			Thoughts:         "เราคงไม่เก่งพอ ไม่ควรเรียนสาขานี้เลย",
			EmotionsID:       3, // ท้อแท้
			Behaviors:        `"ไม่อยากอ่านหนังสือ", "เลี่ยงการพูดเรื่องสอบ"`,
			AlternateThought: "คะแนนครั้งนี้อาจไม่ดี แต่เรายังมีโอกาสแก้ตัว และพัฒนาตัวเองได้อีก",
			UpdatedAt:        time.Now(),
			TherapyCaseID:    1,
		},
	}
	for d := range record {
		db.FirstOrCreate(&record[d], entity.ThoughtRecord{Situation: record[d].Situation})
	}

	fmt.Println("Thought Record data has been added to the database.")

}
