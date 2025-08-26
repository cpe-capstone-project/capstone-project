package config

import (
	"capstone-project/entity"
	"time"
	"fmt"
)

func SetupTherapyCaseDatabase() {
	// migrate ตารางก่อน
	db.AutoMigrate(&entity.CaseStatus{}, &entity.TherapyCase{})

	// ---- Seed CaseStatus ----
	caseStatuses := []entity.CaseStatus{
		{StatusName: "กำลังรักษา"},      
		{StatusName: "รักษาเสร็จสิ้น"},
		{StatusName: "พักการรักษา"},   
		{StatusName: "ยกเลิกการรักษา"},     
	}

	for _, status := range caseStatuses {
		err := db.FirstOrCreate(&status, entity.CaseStatus{StatusName: status.StatusName}).Error
		if err != nil {
			fmt.Println("Error seeding CaseStatus:", err)
		}
	}
	fmt.Println("✅ Seeding CaseStatus Completed")

	// ---- Seed TherapyCase ----
	case1 := &entity.TherapyCase{
		CaseTitle:       "Anxiety Treatment",
		CaseDescription: "Cognitive Behavioral Therapy for anxiety management",
		CaseStartDate:   time.Date(2025, 1, 15, 0, 0, 0, 0, time.UTC),
		CaseStatusID:    1, // กำลังรักษา
		PsychologistID:  1,
		PatientID:       1,
	}

	case2 := &entity.TherapyCase{
		CaseTitle:       "Sleep Improvement",
		CaseDescription: "Therapy for improving sleep habits",
		CaseStartDate:   time.Date(2025, 2, 10, 0, 0, 0, 0, time.UTC),
		CaseStatusID:    2, // รักษาเสร็จสิ้น
		PsychologistID:  1,
		PatientID:       2,
	}

	db.FirstOrCreate(case1, entity.TherapyCase{CaseTitle: "Anxiety Treatment", PatientID: 1})
	db.FirstOrCreate(case2, entity.TherapyCase{CaseTitle: "Sleep Improvement", PatientID: 2})

	fmt.Println("✅ Seeding TherapyCase Completed")
}
