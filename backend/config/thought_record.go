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

	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)

	records := []entity.ThoughtRecord{
		// เดือน 9/2025
		{Situation: "ความเครียดเรื่องงาน", Thoughts: "งานเยอะเกินไป", Behaviors: `"ถอนหายใจ"`, AlternateThought: "สามารถจัดลำดับความสำคัญได้", TagColors: "#faad14", UpdatedAt: time.Date(2025, 9, 1, 10, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 18}}, {Model: gorm.Model{ID: 27}}}},
		{Situation: "รู้สึกเหงา", Thoughts: "ไม่มีใครติดต่อเรา", Behaviors: `"อยู่คนเดียว"`, AlternateThought: "มีเพื่อนคอยสนับสนุน", TagColors: "#1890ff", UpdatedAt: time.Date(2025, 9, 3, 12, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 7, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 24}}, {Model: gorm.Model{ID: 10}}}},
		{Situation: "วิตกเรื่องสุขภาพ", Thoughts: "อาจป่วยหนัก", Behaviors: `"ตรวจร่างกายบ่อย"`, AlternateThought: "ฉันดูแลตัวเองดี", TagColors: "#13c2c2", UpdatedAt: time.Date(2025, 9, 5, 9, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 4, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 18}}, {Model: gorm.Model{ID: 29}}, {Model: gorm.Model{ID: 24}}}},
		{Situation: "ตื่นเต้นเรื่องท่องเที่ยว", Thoughts: "คงสนุกมากแน่", Behaviors: `"วางแผนการเดินทาง"`, AlternateThought: "เตรียมตัวดีจะสนุก", TagColors: "#FF914D", UpdatedAt: time.Date(2025, 9, 7, 16, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 8, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 10}}, {Model: gorm.Model{ID: 11}}}},
		{Situation: "ผิดหวังเรื่องสอบ", Thoughts: "สอบได้คะแนนต่ำ", Behaviors: `"ร้องไห้"`, AlternateThought: "คะแนนสอบไม่ได้สะท้อนความสามารถทั้งหมด", TagColors: "#708090", UpdatedAt: time.Date(2025, 9, 9, 11, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 26}}, {Model: gorm.Model{ID: 18}}}},
		{Situation: "สุขใจเรื่องงานสำเร็จ", Thoughts: "ทำงานเสร็จตามเป้า", Behaviors: `"เฉลิมฉลอง"`, AlternateThought: "ความพยายามให้ผลลัพธ์ดี", TagColors: "#32CD32", UpdatedAt: time.Date(2025, 9, 13, 15, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 10}}, {Model: gorm.Model{ID: 24}}}},
		{Situation: "มีความสุขจากกิจกรรมกีฬา", Thoughts: "สนุกและได้ออกกำลังกาย", Behaviors: `"เล่นกีฬา"`, AlternateThought: "ออกกำลังกายช่วยให้ร่างกายและใจดีขึ้น", TagColors: "#FFEA00", UpdatedAt: time.Date(2025, 9, 16, 17, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 4, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 10}}, {Model: gorm.Model{ID: 11}}, {Model: gorm.Model{ID: 24}}}},

		// เดือน 8/2025
		{Situation: "ทะเลาะกับเพื่อน", Thoughts: "เพื่อนไม่เข้าใจเรา", Behaviors: `"งอน"`, AlternateThought: "ยังปรับความเข้าใจกันได้", TagColors: "#ff4d4f", UpdatedAt: time.Date(2025, 8, 2, 14, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 1, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 24}}, {Model: gorm.Model{ID: 10}}}},
		{Situation: "เครียดเรื่องงานบ้าน", Thoughts: "งานเยอะเกินไป", Behaviors: `"นั่งถอนหายใจ"`, AlternateThought: "สามารถแบ่งงานเป็นส่วนๆได้", TagColors: "#faad14", UpdatedAt: time.Date(2025, 8, 3, 10, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 18}}, {Model: gorm.Model{ID: 25}}}},
		{Situation: "วิตกเรื่องสุขภาพ", Thoughts: "ฉันป่วยหรือเปล่า", Behaviors: `"ตรวจสุขภาพ"`, AlternateThought: "ฉันดูแลตัวเองดีอยู่แล้ว", TagColors: "#13c2c2", UpdatedAt: time.Date(2025, 8, 7, 9, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 4, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 18}}, {Model: gorm.Model{ID: 24}}}},
		{Situation: "ผิดหวังเรื่องสอบ", Thoughts: "คะแนนต่ำเกินไป", Behaviors: `"ร้องไห้"`, AlternateThought: "ยังมีโอกาสปรับปรุงครั้งหน้า", TagColors: "#708090", UpdatedAt: time.Date(2025, 8, 23, 11, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 29}}, {Model: gorm.Model{ID: 18}}}},
		{Situation: "ทะเลาะกับแฟน", Thoughts: "ไม่เข้าใจกัน", Behaviors: `"ไม่คุย"`, AlternateThought: "ยังคุยกันได้และปรับความเข้าใจ", TagColors: "#ff4d4f", UpdatedAt: time.Date(2025, 8, 24, 16, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 1, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 24}}, {Model: gorm.Model{ID: 10}}}},
		{Situation: "ผิดหวังเรื่องงาน", Thoughts: "งานไม่เป็นไปตามแผน", Behaviors: `"ถอนหายใจ"`, AlternateThought: "ทำให้ครั้งหน้าเราเตรียมตัวดีขึ้น", TagColors: "#faad14", UpdatedAt: time.Date(2025, 8, 25, 15, 0, 0, 0, utcPlus7), TherapyCaseID: 1, SituationTagID: 2, Emotions: []entity.Emotions{{Model: gorm.Model{ID: 18}}, {Model: gorm.Model{ID: 29}}, {Model: gorm.Model{ID: 24}}}},
	}

	for i := range records {
		db.FirstOrCreate(&records[i], entity.ThoughtRecord{Situation: records[i].Situation})
	}

	fmt.Println("Thought Record data with multiple emotions has been added to the database.")
}
