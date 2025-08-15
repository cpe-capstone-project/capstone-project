package config

import (
	"capstone-project/entity"
	"time"
)

func SetupTherapyCaseDatabase() {
	db.AutoMigrate(&entity.TherapyCase{})

	// สร้างข้อมูลตัวอย่าง
	case1 := &entity.TherapyCase{
		CaseTitle:       "Anxiety Treatment",
		CaseDescription: "Cognitive Behavioral Therapy for anxiety management",
		CaseStartDate:   time.Date(2025, 1, 15, 0, 0, 0, 0, time.UTC),
		CaseStatusID:    1,
		PsychologistID:  1,
		PatientID:       1,
	}

	case2 := &entity.TherapyCase{
		CaseTitle:       "Sleep Improvement",
		CaseDescription: "Therapy for improving sleep habits",
		CaseStartDate:   time.Date(2025, 2, 10, 0, 0, 0, 0, time.UTC),
		CaseStatusID:    2,
		PsychologistID:  1,
		PatientID:       2,
	}

	// ป้องกันข้อมูลซ้ำ
	db.FirstOrCreate(case1, entity.TherapyCase{CaseTitle: "Anxiety Treatment", PatientID: 1})
	db.FirstOrCreate(case2, entity.TherapyCase{CaseTitle: "Sleep Improvement", PatientID: 2})
}
