package config

import (
	"capstone-project/entity"
	"fmt"
	"time"
)

func SetupFeedbackDatabase() {
	db.AutoMigrate(
		&entity.Feedback{},
		&entity.FeedbackType{},
	)

	// ---- Seed FeedbackType ----
	feedbackTypes := []entity.FeedbackType{
		{
			FeedbackName:     "Weekly Summary",
			FeedbackStartDate: time.Now().AddDate(0, 0, -7),
			FeedbackEndDate:   time.Now(),
		},
		{
			FeedbackName:     "Monthly Summary",
			FeedbackStartDate: time.Now().AddDate(0, -1, 0),
			FeedbackEndDate:   time.Now(),
		},
	}

	for _, ft := range feedbackTypes {
		db.FirstOrCreate(&ft, entity.FeedbackType{FeedbackName: ft.FeedbackName})
	}

	// ---- Seed Feedback (สมมติว่ามี DiaryID, PsychologistID, ThoughtRecordID อยู่แล้ว) ----
	feedback := entity.Feedback{
		FeedbackTitle:   "ควบคุมความรู้สึก",
		FeedbackContent: "อันดับแรกคือห้ามตัดสินความทุกข์ของผู้อื่น อย่างเด็ดขาด และในขณะเดียวกันคุณก็จะ ต้องแสดงความห่วงใยให้ผู้ที่กำลังป่วยได้รับ รู้อย่างเต็มที่ เมื่อผู้ป่วยสัมผัสได้ถึงความจริงใจและความห่วงใยที่คุณมี ",
		PsychologistID:  1, // ต้องมีอยู่ใน DB
		DiaryID:         1, // ต้องมีอยู่ใน DB
		FeedbackTypeID:  1, // Weekly Summary
		ThoughtRecordID: 0, // ต้องมีอยู่ใน DB
	}
	db.FirstOrCreate(&feedback , entity.Feedback{FeedbackTitle: feedback.FeedbackTitle})

	fmt.Println("Feedback data has been added to the database.")
}
