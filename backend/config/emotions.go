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
	EmotionsNeutral := &entity.Emotions{
		Emotionsname:	"neutral",
		Category:		"NeutralEmotions",
		ThaiEmotionsname:	"อารมณ์กลางๆ",
		EmotionsColor:	"#c3c3c3ff",
   	}
	EmotionsAdmiration := &entity.Emotions{
		Emotionsname:	"admiration",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกชื่นชม",
		EmotionsColor:	"#77DD77",
   	}
	EmotionsAmusement := &entity.Emotions{
		Emotionsname:	"amusement",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกขบขัน",
		EmotionsColor:	"#FFD93D",
   	}
	EmotionsApproval := &entity.Emotions{
		Emotionsname:	"approval",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกได้รับการยอมรับ",
		EmotionsColor:	"#6EC1E4",
   	}
	EmotionsCaring := &entity.Emotions{
		Emotionsname:	"caring",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกถึงความห่วงใย",
		EmotionsColor:	"#FFB6C1",
   	}
	EmotionsCuriosity := &entity.Emotions{
		Emotionsname:	"curiosity",
		Category:		"NeutralEmotions",
		ThaiEmotionsname:	"รู้สึกอยากรู้อยากเห็น",
		EmotionsColor:	"#40E0D0",
   	}
	EmotionsDesire := &entity.Emotions{
		Emotionsname:	"desire",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกถึงความปรารถนา",
		EmotionsColor:	"#FF4C4C",
   	}
	EmotionsExcitement := &entity.Emotions{
		Emotionsname:	"excitement",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกตื่นเต้น",
		EmotionsColor:	"#FF914D",
   	}
	EmotionsGratitude := &entity.Emotions{
		Emotionsname:	"gratitude",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกกตัญญู/ขอบคุณ",
		EmotionsColor:	"#FFD700",
   	}
	EmotionsJoy := &entity.Emotions{
		Emotionsname:	"joy",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกมีความสุข",
		EmotionsColor:	"#FFEA00",
   	}
	EmotionsLove := &entity.Emotions{
		Emotionsname:	"love",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกมีความรัก",
		EmotionsColor:	"#FF69B4",
   	}
	EmotionsOptimism := &entity.Emotions{
		Emotionsname:	"optimism",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"มองโลกในแง่ดี",
		EmotionsColor:	"#32CD32",
   	}
	EmotionsRealization := &entity.Emotions{
		Emotionsname:	"realization",
		Category:		"NeutralEmotions",
		ThaiEmotionsname:	"ตระหนักได้",
		EmotionsColor:	"#f7b900ff",
   	}
	EmotionsPride := &entity.Emotions{
		Emotionsname:	"pride",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกถึงความภาคภูมิใจ",
		EmotionsColor:	"#4169E1",
   	}
	EmotionsRelief := &entity.Emotions{
		Emotionsname:	"relief",
		Category:		"PositiveEmotions",
		ThaiEmotionsname:	"รู้สึกโล่งอก",
		EmotionsColor:	"#87CEEB",
   	}
	EmotionsAnger := &entity.Emotions{
		Emotionsname:	"anger",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกโกรธ",
		EmotionsColor:	"#D72638",
   	}
	EmotionsAnnoyance := &entity.Emotions{
		Emotionsname:	"annoyance",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกรำคาญ",
		EmotionsColor:	"#FF6F3C",
   	}
	EmotionsConfusion := &entity.Emotions{
		Emotionsname:	"confusion",
		Category:		"NeutralEmotions",
		ThaiEmotionsname:	"รู้สึกสับสน",
		EmotionsColor:	"#8700f6ff",
   	}
	
	EmotionsDisappointment := &entity.Emotions{
		Emotionsname:	"disappointment",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกผิดหวัง",
		EmotionsColor:	"#708090",
   	}
	EmotionsDisapproval := &entity.Emotions{
		Emotionsname:	"disapproval",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกไม่ยอม",
		EmotionsColor:	"#8B5E3C",
   	}
	EmotionsDisgust := &entity.Emotions{
		Emotionsname:	"disgust",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกขยะแขยง",
		EmotionsColor:	"#556B2F",
   	}
	EmotionsEmbarrassment := &entity.Emotions{
		Emotionsname:	"embarrassment",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกอับอาย",
		EmotionsColor:	"#DB7093",
   	}
	EmotionsFear := &entity.Emotions{
		Emotionsname:	"fear",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกกลัว",
		EmotionsColor:	"#4B0082",
   	}
	EmotionsGrief := &entity.Emotions{
		Emotionsname:	"grief",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกโศกเศร้า",
		EmotionsColor:	"#2F4F4F",
   	}
	EmotionsNervousness := &entity.Emotions{
		Emotionsname:	"nervousness",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกประหม่า",
		EmotionsColor:	"#487e80ff",
   	}
	EmotionsRemorse := &entity.Emotions{
		Emotionsname:	"remorse",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกสำนึกผิด",
		EmotionsColor:	"#654321",
   	}
	Emotionssadness := &entity.Emotions{
		Emotionsname:	"sadness",
		Category:		"NegativeEmotions",
		ThaiEmotionsname:	"รู้สึกเศร้า",
		EmotionsColor:	"#4682B4",
   	}
	EmotionsSurprise := &entity.Emotions{
		Emotionsname:	"surprise",
		ThaiEmotionsname:	"รู้สึกเซอร์ไพรส์",
		Category:		"NeutralEmotions",
		EmotionsColor:	"#f87a0cff",
   	}
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
	db.FirstOrCreate(&EmotionsRealization, &entity.Emotions{Emotionsname: "realization"})
	db.FirstOrCreate(&EmotionsPride, &entity.Emotions{Emotionsname: "pride"})
	db.FirstOrCreate(&EmotionsRelief, &entity.Emotions{Emotionsname: "relief"})
	db.FirstOrCreate(&EmotionsAnger, &entity.Emotions{Emotionsname: "anger"})
	db.FirstOrCreate(&EmotionsAnnoyance, &entity.Emotions{Emotionsname: "annoyance"})
	db.FirstOrCreate(&EmotionsConfusion, &entity.Emotions{Emotionsname: "confusion"})
	db.FirstOrCreate(&EmotionsDisappointment, &entity.Emotions{Emotionsname: "disappointment"})
	db.FirstOrCreate(&EmotionsDisapproval, &entity.Emotions{Emotionsname: "disapproval"})
	db.FirstOrCreate(&EmotionsDisgust, &entity.Emotions{Emotionsname: "disgust"})
	db.FirstOrCreate(&EmotionsEmbarrassment, &entity.Emotions{Emotionsname: "embarrassment"})
	db.FirstOrCreate(&EmotionsFear, &entity.Emotions{Emotionsname: "fear"})
	db.FirstOrCreate(&EmotionsGrief, &entity.Emotions{Emotionsname: "grief"})
	db.FirstOrCreate(&EmotionsNervousness, &entity.Emotions{Emotionsname: "nervousness"})
	db.FirstOrCreate(&EmotionsRemorse, &entity.Emotions{Emotionsname: "remorse"})
	db.FirstOrCreate(&Emotionssadness, &entity.Emotions{Emotionsname: "sadness"})
	db.FirstOrCreate(&EmotionsSurprise, &entity.Emotions{Emotionsname: "surprise"})
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)
	// timetestlayout := time.Date(2025, 8, 23, 12, 00, 0, 0, utcPlus7)
	// EmotionsAnalysisHappy01 := &entity.EmotionAnalysisResults{
	// 	InputText: 			"วันนี้มีเพื่อนร่วมงานมาขอบคุณฉันสำหรับคำแนะนำที่ให้ไปเมื่อสัปดาห์ก่อน เขาบอกว่ามันช่วยเขาได้มาก คำพูดนั้นทำให้ฉันรู้สึกอุ่นใจ เหมือนความพยายามของฉันไม่ได้สูญเปล่า...",
	// 	AnalysisTimestamp: timetestlayout,
	// 	Modelversion:	"SamLowe/roberta-base-go_emotions",
	// 	PrimaryEmotion:	"caring",
	// 	TranslatedText:"Today, a coworker thanked me for some advice I gave him last week. He said it helped him a lot. It gave me a sense of comfort, like my efforts were not in vain...",
	// 	DiaryID:  	2,      
	// 	PatientID: 1,	
	// 	ThoughtRecordID:0,
   	// }
	// db.FirstOrCreate(&EmotionsAnalysisHappy01, &entity.EmotionAnalysisResults{PrimaryEmotion: "caring"})

	// SubEmotionsAnalysis01 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.8478781580924988,
	// 	ConfidencePercentage: 84.78781580924988,
	// 	EmotionAnalysisResultsID:  	1,      	
	// 	EmotionsID:5,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis01, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1})
	// SubEmotionsAnalysis02 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.60275680661201477,
	// 	ConfidencePercentage: 60.275680661201477,
	// 	EmotionAnalysisResultsID:  	1,      	
	// 	EmotionsID:10,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis02, &entity.SubEmotionAnalysis{EmotionsID: 4})
	// timetestlayout02 := time.Date(2025, 8, 24, 12, 00, 0, 0, utcPlus7)
	// EmotionsAnalysisBad01 := &entity.EmotionAnalysisResults{
	// 	InputText: 			"วันนี้ทั้งวันแทบไม่ได้คุยกับใครเลย ถึงแม้จะอยู่ท่ามกลางผู้คน แต่กลับรู้สึกเหมือนตัวเองล่องหน ไม่มีใครเห็นหรือสนใจว่าฉันอยู่ตรงนี้ มันทำให้รู้สึกเศร้าอย่างบอกไม่ถูก...",
	// 	TranslatedText: "I haven&#39;t talked to anyone all day. Even though I&#39;m surrounded by people, I feel invisible. No one sees or cares that I&#39;m here. It makes me feel sad in an indescribable way...",
	// 	AnalysisTimestamp: timetestlayout02,
	// 	Modelversion:	"SamLowe/roberta-base-go_emotions",
	// 	PrimaryEmotion:	"sadness",
	// 	DiaryID:  	1,  
	// 	PatientID: 1,	    	
	// 	ThoughtRecordID:0,
   	// }
	// db.FirstOrCreate(&EmotionsAnalysisBad01, &entity.EmotionAnalysisResults{PrimaryEmotion: "sadness"})

	// SubEmotionsAnalysis21 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.8078781580924988,
	// 	ConfidencePercentage: 80.78781580924988,
	// 	EmotionAnalysisResultsID:  	2,      	
	// 	EmotionsID:25,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis21, &entity.SubEmotionAnalysis{EmotionsID: 25})
	// SubEmotionsAnalysis22 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.103620804846287,
	// 	ConfidencePercentage: 10.3620804846287,
	// 	EmotionAnalysisResultsID:  	2,      	
	// 	EmotionsID:17,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis22, &entity.SubEmotionAnalysis{EmotionsID: 17})
	// SubEmotionsAnalysis23 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.0270794611424208,
	// 	ConfidencePercentage: 2.70794611424208,
	// 	EmotionAnalysisResultsID:  	2,      	
	// 	EmotionsID:3,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis23, &entity.SubEmotionAnalysis{EmotionsID: 3})
	// timetestlayout03 := time.Date(2025, 9, 1, 12, 00, 0, 0, utcPlus7)
	// EmotionsAnalysisBad02 := &entity.EmotionAnalysisResults{
	// 	InputText: 			"วันนี้ฉันกล้าพูดในที่ประชุม แม้จะรู้สึกประหม่า แต่ฉันก็ทำได้ และได้รับคำชมจากหัวหน้าด้วย รู้สึกภูมิใจที่กล้าแสดงความเห็น แม้จะเป็นก้าวเล็กๆ แต่ก็เป็นก้าวที่สำคัญ...",
	// 	TranslatedText: "Today I dared to speak in a meeting. Although I felt nervous, I did it and received praise from my boss. I feel proud that I dared to express my opinion. Even though it was a small step, it was an important step...",
	// 	AnalysisTimestamp: timetestlayout03,
	// 	Modelversion:	"SamLowe/roberta-base-go_emotions",
	// 	PrimaryEmotion:	"nervousness",
	// 	PatientID: 1,	
	// 	DiaryID:  	4,      	
	// 	ThoughtRecordID:0,
   	// }
	// db.FirstOrCreate(&EmotionsAnalysisBad02, &entity.EmotionAnalysisResults{PrimaryEmotion: "nervousness"})
	// SubEmotionsAnalysis31 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.8878781580924988,
	// 	ConfidencePercentage: 88.78781580924988,
	// 	EmotionAnalysisResultsID:  	3,      	
	// 	EmotionsID:23,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis31, &entity.SubEmotionAnalysis{EmotionsID: 23})
	// SubEmotionsAnalysis32 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.873620804846287,
	// 	ConfidencePercentage: 87.3620804846287,
	// 	EmotionAnalysisResultsID:  	3,      	
	// 	EmotionsID:4,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis32, &entity.SubEmotionAnalysis{EmotionsID: 4})
	// SubEmotionsAnalysis33 := &entity.SubEmotionAnalysis{
	// 	Score: 			0.2070794611424208,
	// 	ConfidencePercentage: 20.70794611424208,
	// 	EmotionAnalysisResultsID:  	3,      	
	// 	EmotionsID:14,
   	// }
	// db.FirstOrCreate(&SubEmotionsAnalysis33, &entity.SubEmotionAnalysis{EmotionsID: 14})
	timetestlayout04 := time.Date(2025, 8, 23, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisThoughtR01 := &entity.EmotionAnalysisResults{
		InputText: 			"ทำให้ครั้งหน้าเราเตรียมตัวดีขึ้น ทำให้ครั้งหน้าเราเตรียมตัวดีขึ้น",
		TranslatedText: "Make us better prepared next time. Make us better prepared next time.",
		AnalysisTimestamp: timetestlayout04,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"caring",
		PatientID: 1,	
		DiaryID:  	0,      	
		ThoughtRecordID:11,
   	}
	db.FirstOrCreate(&EmotionsAnalysisThoughtR01, &entity.EmotionAnalysisResults{ThoughtRecordID: 11})
	SubEmotionsAnalysis41 := &entity.SubEmotionAnalysis{
		Score: 			0.496004402637482,
		ConfidencePercentage: 49.6004402637482,
		EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR01.ID,      	
		EmotionsID:5,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis41, &entity.SubEmotionAnalysis{EmotionsID: 5,EmotionAnalysisResultsID:  EmotionsAnalysisThoughtR01.ID})
	SubEmotionsAnalysis42 := &entity.SubEmotionAnalysis{
		Score: 			0.286047160625458,
		ConfidencePercentage: 28.6047160625458,
		EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR01.ID,      	
		EmotionsID:1,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis42, &entity.SubEmotionAnalysis{EmotionsID: 4,EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR01.ID})
	SubEmotionsAnalysis43 := &entity.SubEmotionAnalysis{
		Score: 			0.178936704993248,
		ConfidencePercentage: 17.8936704993248,
		EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR01.ID,      	
		EmotionsID:12,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis43, &entity.SubEmotionAnalysis{EmotionsID: 12, EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR01.ID})
	timetestlayout05 := time.Date(2025, 8, 24, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisThoughtR02 := &entity.EmotionAnalysisResults{
		InputText: 			"ยังคุยกันได้และปรับความเข้าใจ ไม่คุย",
		TranslatedText: "We can still talk and understand each other. We don't talk.",
		AnalysisTimestamp: timetestlayout05,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"neutral",
		PatientID: 1,	
		DiaryID:  	0,      	
		ThoughtRecordID:10,
   	}
	db.FirstOrCreate(&EmotionsAnalysisThoughtR02, &entity.EmotionAnalysisResults{PrimaryEmotion: "neutral"})
	SubEmotionsAnalysis51 := &entity.SubEmotionAnalysis{
		Score: 			0.676080465316772,
		ConfidencePercentage: 67.6080465316772,
		EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR02.ID,      	
		EmotionsID:1,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis51, &entity.SubEmotionAnalysis{EmotionsID: 1, EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR02.ID})
	SubEmotionsAnalysis52 := &entity.SubEmotionAnalysis{
		Score: 			0.409135073423386,
		ConfidencePercentage: 40.9135073423386,
		EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR02.ID,      	
		EmotionsID:13,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis52, &entity.SubEmotionAnalysis{EmotionsID: 13, EmotionAnalysisResultsID:  	EmotionsAnalysisThoughtR02.ID})
}
