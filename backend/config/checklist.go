package config

import (
	"capstone-project/entity"
	"time"

	"gorm.io/datatypes"
)

// SetupInitialChecklist ใช้ seed ข้อมูล checklist ตัวอย่าง
func SetupInitialChecklist() {
	// ✅ Migrate schema ก่อน (เผื่อยังไม่มีตาราง)
	db.AutoMigrate(&entity.DailyChecklist{})

	today := time.Now().Truncate(24 * time.Hour) // ตัดเวลา เหลือแต่วันที่

	db.FirstOrCreate(&entity.DailyChecklist{}, entity.DailyChecklist{
		PatientID: 1,
		Date:      today,
		Timezone:  "Asia/Bangkok",
		Tasks: datatypes.JSONMap{
			"tasks": []map[string]string{
				{"id": "write_diary", "label": "เขียนไดอารี่"},
				{"id": "thought_record", "label": "ทำ Thought Record"},
				{"id": "analyze_diary_daily", "label": "วิเคราะห์ไดอารี่ (รายวัน)"},
			},
		},
		Done: datatypes.JSONMap{
			"write_diary":         false,
			"thought_record":      false,
			"analyze_diary_daily": false,
		},
		Version: 1,
	})
}
