package config
import (
	 "time"
	"capstone-project/entity"
)

func SetupNotifications(){
	db.AutoMigrate(
       &entity.Notifications{},
   	)
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)
	timetestlayout := time.Date(2025, 7, 15, 12, 00, 0, 0, utcPlus7)
	Notificationsfrist := &entity.Notifications{
		Message: 			"ทดสอบการแจ้งเตือน",
		Sentat :  timetestlayout,
		NotificationType:	"TestNotification",
		Seen:          false,
		FeedbackID:  	1,      	
		PatientID: 1,
		PsychologistID: 1,
		DiaryID: 1,
		EmotionAnalysisResultsID: 1,
   	}
	db.FirstOrCreate(&Notificationsfrist, &entity.Notifications{NotificationType: "TestNotification.0"})
}
