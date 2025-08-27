package config

import (
	"log"
	"capstone-project/entity"
)

func SetuprequestData() {
	if DB() == nil {
		log.Println("❌ DB not connected")
		return
	}

	req := entity.Request{
		Type:           "ขอคำปรึกษา",
		Detail:         "รู้สึกเครียดเรื่องการเรียน",
		PatientID:      1, // ต้องมี Patient id=1
		PsychologistID: 1, // ต้องมี Psychologist id=1
	}

	if err := DB().FirstOrCreate(
		&req,
		entity.Request{PatientID: 1, PsychologistID: 1, Type: "ขอคำปรึกษา"},
	).Error; err != nil {
		log.Printf("❌ seed request error: %v", err)
	}
}
