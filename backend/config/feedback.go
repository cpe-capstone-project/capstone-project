package config

import (
	"capstone-project/entity"
	"fmt"
)

func SetupFeedbackDatabase() {
	db.AutoMigrate(
		&entity.FeedbackDiary{},
		&entity.Feedbacks{},
		&entity.FeedbackTime{},
		&entity.FeedbackType{},
	)

	// ---- Seed FeedbackTime ----
	feedbackTimes := []entity.FeedbackTime{
		{
			FeedbackTimeName: "Diary Summary",
		},
		{
			FeedbackTimeName: "Daily Summary",
		},
		{
			FeedbackTimeName: "Weekly Summary",
		},
		{
			FeedbackTimeName: "Monthly Summary",
		},
	}

	for _, ft := range feedbackTimes {
		db.Where(entity.FeedbackTime{FeedbackTimeName: ft.FeedbackTimeName}).
			Assign(ft).
			FirstOrCreate(&ft)
	}

	// ---- Seed FeedbackType ----
	feedbackTypes := []entity.FeedbackType{
		{FeedbackTypeName: "Diary"},
		{FeedbackTypeName: "Thought Record"},
	}

	for _, ft := range feedbackTypes {
		db.Where(entity.FeedbackType{FeedbackTypeName: ft.FeedbackTypeName}).
			Assign(ft).
			FirstOrCreate(&ft)
	}

	// ---- Seed Feedback (สมมติว่ามี PsychologistID และ PatientID อยู่แล้วใน DB) ----
	feedback := entity.Feedbacks{
		FeedbackTitle:   "ควบคุมความรู้สึก",
		FeedbackContent: "อันดับแรกคือห้ามตัดสินความทุกข์ของผู้อื่น อย่างเด็ดขาด และในขณะเดียวกันคุณก็ต้องแสดงความห่วงใยให้ผู้ที่กำลังป่วยได้รับรู้อย่างเต็มที่ เมื่อผู้ป่วยสัมผัสได้ถึงความจริงใจและความห่วงใยที่คุณมี",
		PsychologistID:  1, // ต้องมีอยู่ใน DB
		PatientID:       1, // ต้องมีอยู่ใน DB
		FeedbackTypeID:  1, // General
		FeedbackTimeID:  2, // Weekly Summary
	}

	db.Where(entity.Feedbacks{FeedbackTitle: feedback.FeedbackTitle}).
		Assign(feedback).
		FirstOrCreate(&feedback)

	fmt.Println("Feedback data has been added to the database.")
}
