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
			FeedbackTimeName: "Diary",
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
	feedbacks := []entity.Feedbacks{
		{
			FeedbackTitle:   "ควบคุมความรู้สึก",
			FeedbackContent: "อันดับแรกคือห้ามตัดสินความทุกข์ของผู้อื่น อย่างเด็ดขาด และในขณะเดียวกันคุณก็ต้องแสดงความห่วงใยให้ผู้ที่กำลังป่วยได้รับรู้อย่างเต็มที่ เมื่อผู้ป่วยสัมผัสได้ถึงความจริงใจและความห่วงใยที่คุณมี",
			PsychologistID:  1, // ต้องมีอยู่ใน DB
			PatientID:       1, // ต้องมีอยู่ใน DB
			FeedbackTypeID:  1, // General
			FeedbackTimeID:  2, // Weekly Summary
		},
		{
			FeedbackTitle:   "การหายใจเพื่อลดความเครียด",
			FeedbackContent: "ลองใช้เทคนิคการหายใจลึก ๆ นับ 1 ถึง 4 ในการหายใจเข้า และนับ 1 ถึง 6 ในการหายใจออก เพื่อช่วยปรับสมดุลจิตใจ",
			PsychologistID:  1,
			PatientID:       1,
			FeedbackTypeID:  1, 
			FeedbackTimeID:  1, // Daily Summary
		},
		{
			FeedbackTitle:   "การจัดการเวลา",
			FeedbackContent: "วางแผนเวลานอนและเวลาตื่นให้ชัดเจน รวมถึงแบ่งเวลาเพื่อกิจกรรมที่ช่วยผ่อนคลาย เช่น อ่านหนังสือหรือฟังเพลง",
			PsychologistID:  1,
			PatientID:       1,
			FeedbackTypeID:  1, 
			FeedbackTimeID:  3, // Monthly Summary
		},
		{
			FeedbackTitle:   "เขียนบันทึกความรู้สึก",
			FeedbackContent: "ลองจดบันทึกสิ่งที่รู้สึกในแต่ละวัน เพื่อให้มองเห็นความคิดและอารมณ์ของตนเองอย่างชัดเจนมากขึ้น",
			PsychologistID:  1,
			PatientID:       1,
			FeedbackTypeID:  1, 
			FeedbackTimeID:  4, // Daily Summary
		},
		{
			FeedbackTitle:   "ออกกำลังกายเบา ๆ",
			FeedbackContent: "การเดินเล่น 10-15 นาที สามารถช่วยให้จิตใจผ่อนคลาย ลดความเครียด และนอนหลับได้ดีขึ้น",
			PsychologistID:  1,
			PatientID:       1,
			FeedbackTypeID:  1, 
			FeedbackTimeID:  2, // Weekly Summary
		},
		{
			FeedbackTitle:   "นอน ๆ",
			FeedbackContent: "การนอน 60-360 นาที สามารถช่วยให้จิตใจผ่อนคลาย ลดความเครียด และนอนหลับได้ดีขึ้น",
			ThoughtRecordID: 1,
			PsychologistID:  1,
			PatientID:       1,
			FeedbackTypeID:  2, 
			FeedbackTimeID:  1, // Weekly Summary
		},
	}
	

	for _, fb := range feedbacks {
	// insert/update feedback
	db.Where(entity.Feedbacks{FeedbackTitle: fb.FeedbackTitle}).
		Assign(fb).
		FirstOrCreate(&fb)

	// สร้าง FeedbackDiary ผูกกับ DiaryID = 1
	feedbackDiary := entity.FeedbackDiary{
		DiaryID:    1,
		FeedbackID: fb.ID,
	}

	db.Where(entity.FeedbackDiary{
		DiaryID:    feedbackDiary.DiaryID,
		FeedbackID: feedbackDiary.FeedbackID,
	}).
		Assign(feedbackDiary).
		FirstOrCreate(&feedbackDiary)
}

	fmt.Println("Feedback data has been added to the database.")
	
}


