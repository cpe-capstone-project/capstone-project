package config

import (
	 "time"
	"capstone-project/entity"
)

func SetupEmotionDatabase(){
	db.AutoMigrate(
       &entity.Emotions{},
	   &entity.EmotionAnalysisResults{},
	   &entity.SubEmotionAnalysis{},
   	)
	// EmotionsPositive := &entity.Emotions{
	// 	Emotionsname:	"positive",
	// 	Category:		"sentiment",

   	// }
	// EmotionsNegative := &entity.Emotions{
	// 	Emotionsname:	"negative",
	// 	Category:		"sentiment",
   	// }
	EmotionsNeutral := &entity.Emotions{
		Emotionsname:	"neutral",
		Category:		"sentiment",
		EmotionsColor:	"#c3c3c3ff",
   	}
	EmotionsAdmiration := &entity.Emotions{
		Emotionsname:	"admiration",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ชื่นชม",
		EmotionsColor:	"#77DD77",
   	}
	EmotionsAmusement := &entity.Emotions{
		Emotionsname:	"amusement",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ขบขัน",
		EmotionsColor:	"#FFD93D",
   	}
	EmotionsApproval := &entity.Emotions{
		Emotionsname:	"approval",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"การยอมรับ",
		EmotionsColor:	"#6EC1E4",
   	}
	EmotionsCaring := &entity.Emotions{
		Emotionsname:	"caring",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความห่วงใย",
		EmotionsColor:	"#FFB6C1",
   	}
	EmotionsCuriosity := &entity.Emotions{
		Emotionsname:	"curiosity",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"อยากรู้อยากเห็น",
		EmotionsColor:	"#40E0D0",
   	}
	EmotionsDesire := &entity.Emotions{
		Emotionsname:	"desire",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความปรารถนา",
		EmotionsColor:	"#FF4C4C",
   	}
	EmotionsExcitement := &entity.Emotions{
		Emotionsname:	"excitement",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ตื่นเต้น",
		EmotionsColor:	"#FF914D",
   	}
	EmotionsGratitude := &entity.Emotions{
		Emotionsname:	"gratitude",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"กตัญญู/ขอบคุณ",
		EmotionsColor:	"#FFD700",
   	}
	EmotionsJoy := &entity.Emotions{
		Emotionsname:	"joy",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความสุข",
		EmotionsColor:	"#FFEA00",
   	}
	EmotionsLove := &entity.Emotions{
		Emotionsname:	"love",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความรัก",
		EmotionsColor:	"#FF69B4",
   	}
	EmotionsOptimism := &entity.Emotions{
		Emotionsname:	"optimism",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความมองโลกในแง่ดี",
		EmotionsColor:	"#32CD32",
   	}
	EmotionsPride := &entity.Emotions{
		Emotionsname:	"pride",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความภาคภูมิใจ",
		EmotionsColor:	"#4169E1",
   	}
	EmotionsRelief := &entity.Emotions{
		Emotionsname:	"relief",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"ความโล่งอก",
		EmotionsColor:	"#87CEEB",
   	}
	EmotionsAnger := &entity.Emotions{
		Emotionsname:	"anger",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความโกรธ",
		EmotionsColor:	"#D72638",
   	}
	EmotionsAnnoyance := &entity.Emotions{
		Emotionsname:	"annoyance",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความรำคาญ",
		EmotionsColor:	"#FF6F3C",
   	}
	EmotionsDisappointment := &entity.Emotions{
		Emotionsname:	"disappointment",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความผิดหวัง",
		EmotionsColor:	"#708090",
   	}
	EmotionsDisapproval := &entity.Emotions{
		Emotionsname:	"disapproval",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"การไม่เห็นด้วย",
		EmotionsColor:	"#8B5E3C",
   	}
	EmotionsDisgust := &entity.Emotions{
		Emotionsname:	"disgust",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความขยะแขยง",
		EmotionsColor:	"#556B2F",
   	}
	EmotionsEmbarrassment := &entity.Emotions{
		Emotionsname:	"embarrassment",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความอับอาย",
		EmotionsColor:	"#DB7093",
   	}
	EmotionsFear := &entity.Emotions{
		Emotionsname:	"fear",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความกลัว",
		EmotionsColor:	"#4B0082",
   	}
	EmotionsGrief := &entity.Emotions{
		Emotionsname:	"grief",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความโศกเศร้า",
		EmotionsColor:	"#2F4F4F",
   	}
	EmotionsNervousness := &entity.Emotions{
		Emotionsname:	"nervousness",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความประหม่า",
		EmotionsColor:	"#5F9EA0",
   	}
	EmotionsRemorse := &entity.Emotions{
		Emotionsname:	"remorse",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความสำนึกผิด",
		EmotionsColor:	"#654321",
   	}
	Emotionssadness := &entity.Emotions{
		Emotionsname:	"sadness",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"ความเศร้า",
		EmotionsColor:	"#4682B4",
   	}
   	// db.FirstOrCreate(&EmotionsPositive, &entity.Emotions{Emotionsname: "positive"})
   	// db.FirstOrCreate(&EmotionsNegative, &entity.Emotions{Emotionsname: "negative"})
	db.FirstOrCreate(&EmotionsNeutral, &entity.Emotions{Emotionsname: "neutral"})

	db.FirstOrCreate(&EmotionsAdmiration, &entity.Emotions{Emotionsname: "admiration"})
   	db.FirstOrCreate(&EmotionsAmusement, &entity.Emotions{Emotionsname: "amusement"})
	db.FirstOrCreate(&EmotionsApproval, &entity.Emotions{Emotionsname: "approval"})
	db.FirstOrCreate(&EmotionsCaring, &entity.Emotions{Emotionsname: "caring"})
	db.FirstOrCreate(&EmotionsCuriosity, &entity.Emotions{Emotionsname: "curiosity"})
	db.FirstOrCreate(&EmotionsDesire, &entity.Emotions{Emotionsname: "desire"})
	db.FirstOrCreate(&EmotionsExcitement, &entity.Emotions{Emotionsname: "excitement"})
	db.FirstOrCreate(&EmotionsGratitude, &entity.Emotions{Emotionsname: "gratitude"})
	db.FirstOrCreate(&EmotionsJoy, &entity.Emotions{Emotionsname: "joy"})
	db.FirstOrCreate(&EmotionsLove, &entity.Emotions{Emotionsname: "love"})
	db.FirstOrCreate(&EmotionsOptimism, &entity.Emotions{Emotionsname: "optimism"})
	db.FirstOrCreate(&EmotionsPride, &entity.Emotions{Emotionsname: "pride"})
	db.FirstOrCreate(&EmotionsRelief, &entity.Emotions{Emotionsname: "relief"})

	db.FirstOrCreate(&EmotionsAnger, &entity.Emotions{Emotionsname: "anger"})
	db.FirstOrCreate(&EmotionsAnnoyance, &entity.Emotions{Emotionsname: "annoyance"})
	db.FirstOrCreate(&EmotionsDisappointment, &entity.Emotions{Emotionsname: "disappointment"})
	db.FirstOrCreate(&EmotionsDisapproval, &entity.Emotions{Emotionsname: "disapproval"})
	db.FirstOrCreate(&EmotionsDisgust, &entity.Emotions{Emotionsname: "disgust"})
	db.FirstOrCreate(&EmotionsEmbarrassment, &entity.Emotions{Emotionsname: "embarrassment"})
	db.FirstOrCreate(&EmotionsFear, &entity.Emotions{Emotionsname: "fear"})
	db.FirstOrCreate(&EmotionsGrief, &entity.Emotions{Emotionsname: "grief"})
	db.FirstOrCreate(&EmotionsNervousness, &entity.Emotions{Emotionsname: "nervousness"})
	db.FirstOrCreate(&EmotionsRemorse, &entity.Emotions{Emotionsname: "remorse"})
	db.FirstOrCreate(&Emotionssadness, &entity.Emotions{Emotionsname: "sadness"})
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)
	timetestlayout := time.Date(2025, 8, 23, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisHappy01 := &entity.EmotionAnalysisResults{
		InputText: 			"<p>วันนี้มีเพื่อนร่วมงานมาขอบคุณฉันสำหรับคำแนะนำที่ให้ไปเมื่อสัปดาห์ก่อน เขาบอกว่ามันช่วยเขาได้มาก คำพูดนั้นทำให้ฉันรู้สึกอุ่นใจ เหมือนความพยายามของฉันไม่ได้สูญเปล่า...</p>",
		AnalysisTimestamp: timetestlayout,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"caring",
		TranslatedText:"Today, a coworker thanked me for some advice I gave him last week. He said it helped him a lot. It gave me a sense of comfort, like my efforts were not in vain...",
		DiaryID:  	2,      
		PatientID: 1,	
		ThoughtRecordID:0,
   	}
	db.FirstOrCreate(&EmotionsAnalysisHappy01, &entity.EmotionAnalysisResults{PrimaryEmotion: "caring"})

	SubEmotionsAnalysis01 := &entity.SubEmotionAnalysis{
		Score: 			0.8478781580924988,
		ConfidencePercentage: 84.78781580924988,
		EmotionAnalysisResultsID:  	1,      	
		EmotionsID:5,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis01, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1})
	SubEmotionsAnalysis02 := &entity.SubEmotionAnalysis{
		Score: 			0.60275680661201477,
		ConfidencePercentage: 60.275680661201477,
		EmotionAnalysisResultsID:  	1,      	
		EmotionsID:10,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis02, &entity.SubEmotionAnalysis{EmotionsID: 4})
	timetestlayout02 := time.Date(2025, 8, 24, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisBad01 := &entity.EmotionAnalysisResults{
		InputText: 			"<p>วันนี้ทั้งวันแทบไม่ได้คุยกับใครเลย ถึงแม้จะอยู่ท่ามกลางผู้คน แต่กลับรู้สึกเหมือนตัวเองล่องหน ไม่มีใครเห็นหรือสนใจว่าฉันอยู่ตรงนี้ มันทำให้รู้สึกเศร้าอย่างบอกไม่ถูก...</p>",
		TranslatedText: "I haven&#39;t talked to anyone all day. Even though I&#39;m surrounded by people, I feel invisible. No one sees or cares that I&#39;m here. It makes me feel sad in an indescribable way...",
		AnalysisTimestamp: timetestlayout02,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"sadness",
		DiaryID:  	1,  
		PatientID: 1,	    	
		ThoughtRecordID:0,
   	}
	db.FirstOrCreate(&EmotionsAnalysisBad01, &entity.EmotionAnalysisResults{PrimaryEmotion: "sadness"})

	SubEmotionsAnalysis21 := &entity.SubEmotionAnalysis{
		Score: 			0.8078781580924988,
		ConfidencePercentage: 80.78781580924988,
		EmotionAnalysisResultsID:  	2,      	
		EmotionsID:25,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis21, &entity.SubEmotionAnalysis{EmotionsID: 25})
	SubEmotionsAnalysis22 := &entity.SubEmotionAnalysis{
		Score: 			0.103620804846287,
		ConfidencePercentage: 10.3620804846287,
		EmotionAnalysisResultsID:  	2,      	
		EmotionsID:17,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis22, &entity.SubEmotionAnalysis{EmotionsID: 17})
	SubEmotionsAnalysis23 := &entity.SubEmotionAnalysis{
		Score: 			0.0270794611424208,
		ConfidencePercentage: 2.70794611424208,
		EmotionAnalysisResultsID:  	2,      	
		EmotionsID:3,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis23, &entity.SubEmotionAnalysis{EmotionsID: 3})
	timetestlayout03 := time.Date(2025, 9, 1, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisBad02 := &entity.EmotionAnalysisResults{
		InputText: 			"<p>วันนี้ฉันกล้าพูดในที่ประชุม แม้จะรู้สึกประหม่า แต่ฉันก็ทำได้ และได้รับคำชมจากหัวหน้าด้วย รู้สึกภูมิใจที่กล้าแสดงความเห็น แม้จะเป็นก้าวเล็กๆ แต่ก็เป็นก้าวที่สำคัญ...</p>",
		TranslatedText: "Today I dared to speak in a meeting. Although I felt nervous, I did it and received praise from my boss. I feel proud that I dared to express my opinion. Even though it was a small step, it was an important step...",
		AnalysisTimestamp: timetestlayout03,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"nervousness",
		PatientID: 1,	
		DiaryID:  	4,      	
		ThoughtRecordID:0,
   	}
	db.FirstOrCreate(&EmotionsAnalysisBad02, &entity.EmotionAnalysisResults{PrimaryEmotion: "nervousness"})
	SubEmotionsAnalysis31 := &entity.SubEmotionAnalysis{
		Score: 			0.8878781580924988,
		ConfidencePercentage: 88.78781580924988,
		EmotionAnalysisResultsID:  	3,      	
		EmotionsID:23,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis31, &entity.SubEmotionAnalysis{EmotionsID: 23})
	SubEmotionsAnalysis32 := &entity.SubEmotionAnalysis{
		Score: 			0.873620804846287,
		ConfidencePercentage: 87.3620804846287,
		EmotionAnalysisResultsID:  	3,      	
		EmotionsID:4,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis32, &entity.SubEmotionAnalysis{EmotionsID: 4})
	SubEmotionsAnalysis33 := &entity.SubEmotionAnalysis{
		Score: 			0.2070794611424208,
		ConfidencePercentage: 20.70794611424208,
		EmotionAnalysisResultsID:  	3,      	
		EmotionsID:14,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis33, &entity.SubEmotionAnalysis{EmotionsID: 14})
}
