package config

import (
	"capstone-project/entity"
	"fmt"

)

func SetupSituationTagDatabase() {
	db := DB()
	db.AutoMigrate(&entity.SituationTag{})

	tags := []entity.SituationTag{
		{Name: "ความสัมพันธ์", Color: "#ff4d4f"},     // 🔴 เรื่องเพื่อน/คู่รัก/สังคม
		{Name: "การทำงาน/การเรียน", Color: "#faad14"}, // 🟡 ความกดดันด้านงานหรือเรียน
		{Name: "ครอบครัว", Color: "#52c41a"},        // 🟢 ความสัมพันธ์ในครอบครัว
		{Name: "สุขภาพกาย", Color: "#13c2c2"},        // 🟦 ปัญหาสุขภาพ
		{Name: "สุขภาพใจ", Color: "#722ed1"},         // 🟣 ภาวะซึมเศร้า วิตกกังวล
		{Name: "การเงิน", Color: "#eb2f96"},          // 💗 ความกังวลเรื่องเงิน
		{Name: "ความมั่นใจในตนเอง", Color: "#1890ff"}, // 🔵 Self-esteem
		{Name: "การเปลี่ยนแปลงชีวิต", Color: "#a0d911"}, // 🟩 เช่น ย้ายงาน ย้ายที่อยู่
	}

	for i := range tags {
		db.FirstOrCreate(&tags[i], entity.SituationTag{Name: tags[i].Name})
	}

	fmt.Println("SituationTag data has been added to the database.")
}
