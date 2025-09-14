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
	EmotionsPositive := &entity.Emotions{
		Emotionsname:	"positive",
		Category:		"sentiment",

   	}
	EmotionsNegative := &entity.Emotions{
		Emotionsname:	"negative",
		Category:		"sentiment",
   	}
	EmotionsNeutral := &entity.Emotions{
		Emotionsname:	"neutral",
		Category:		"sentiment",
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
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความโกรธ",
		EmotionsColor:	"#D72638",
   	}
	EmotionsAnnoyance := &entity.Emotions{
		Emotionsname:	"annoyance",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความโกรธ",
		EmotionsColor:	"#FF6F3C",
   	}
	EmotionsDisappointment := &entity.Emotions{
		Emotionsname:	"disappointment",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความผิดหวัง",
		EmotionsColor:	"#708090",
   	}
	EmotionsDisapproval := &entity.Emotions{
		Emotionsname:	"disapproval",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"การไม่เห็นด้วย",
		EmotionsColor:	"#8B5E3C",
   	}
	EmotionsDisgust := &entity.Emotions{
		Emotionsname:	"disgust",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความขยะแขยง",
		EmotionsColor:	"#556B2F",
   	}
	EmotionsEmbarrassment := &entity.Emotions{
		Emotionsname:	"embarrassment",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความอับอาย",
		EmotionsColor:	"#DB7093",
   	}
	EmotionsFear := &entity.Emotions{
		Emotionsname:	"fear",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความกลัว",
		EmotionsColor:	"#4B0082",
   	}
	EmotionsGrief := &entity.Emotions{
		Emotionsname:	"grief",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความโศกเศร้า",
		EmotionsColor:	"#2F4F4F",
   	}
	EmotionsNervousness := &entity.Emotions{
		Emotionsname:	"nervousness",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความประหม่า",
		EmotionsColor:	"#5F9EA0",
   	}
	EmotionsRemorse := &entity.Emotions{
		Emotionsname:	"remorse",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความสำนึกผิด",
		EmotionsColor:	"#654321",
   	}
	Emotionssadness := &entity.Emotions{
		Emotionsname:	"sadness",
		Category:		"NegativeEmotions ",
		ThaiEmotionsname:	"ความเศร้า",
		EmotionsColor:	"#4682B4",
   	}
   	db.FirstOrCreate(&EmotionsPositive, &entity.Emotions{Emotionsname: "positive"})
   	db.FirstOrCreate(&EmotionsNegative, &entity.Emotions{Emotionsname: "negative"})
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

	// กำหนด timezone UTC+7
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)

	// EmotionAnalysisResults สำหรับ DiaryID 1-10
	EmotionsAnalysis01 := &entity.EmotionAnalysisResults{
		InputText: 			"I'm so excited about my new job!",
		AnalysisTimestamp: 	time.Date(2025, 7, 15, 12, 0, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"excitement",
		TranslatedText:		"",
		DiaryID:  			1,      	
		ThoughtRecordID:	1,
   	}
	db.FirstOrCreate(&EmotionsAnalysis01, &entity.EmotionAnalysisResults{DiaryID: 1})

	EmotionsAnalysis02 := &entity.EmotionAnalysisResults{
		InputText: 			"Today was really disappointing. Nothing went as planned.",
		AnalysisTimestamp: 	time.Date(2025, 7, 16, 9, 30, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"disappointment",
		TranslatedText:		"",
		DiaryID:  			2,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis02, &entity.EmotionAnalysisResults{DiaryID: 2})

	EmotionsAnalysis03 := &entity.EmotionAnalysisResults{
		InputText: 			"I'm so grateful for my friends and family. They mean everything to me.",
		AnalysisTimestamp: 	time.Date(2025, 7, 17, 18, 45, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"gratitude",
		TranslatedText:		"",
		DiaryID:  			3,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis03, &entity.EmotionAnalysisResults{DiaryID: 3})

	EmotionsAnalysis04 := &entity.EmotionAnalysisResults{
		InputText: 			"I'm worried about tomorrow's presentation. What if I mess up?",
		AnalysisTimestamp: 	time.Date(2025, 7, 18, 22, 15, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"nervousness",
		TranslatedText:		"",
		DiaryID:  			4,      	
		ThoughtRecordID:	2,
   	}
	db.FirstOrCreate(&EmotionsAnalysis04, &entity.EmotionAnalysisResults{DiaryID: 4})

	EmotionsAnalysis05 := &entity.EmotionAnalysisResults{
		InputText: 			"Spending time with my partner makes me feel so loved and happy.",
		AnalysisTimestamp: 	time.Date(2025, 7, 19, 20, 30, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"love",
		TranslatedText:		"",
		DiaryID:  			5,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis05, &entity.EmotionAnalysisResults{DiaryID: 5})

	EmotionsAnalysis06 := &entity.EmotionAnalysisResults{
		InputText: 			"I can't believe I said that. I feel so embarrassed and stupid.",
		AnalysisTimestamp: 	time.Date(2025, 7, 20, 14, 20, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"embarrassment",
		TranslatedText:		"",
		DiaryID:  			6,      	
		ThoughtRecordID:	3,
   	}
	db.FirstOrCreate(&EmotionsAnalysis06, &entity.EmotionAnalysisResults{DiaryID: 6})

	EmotionsAnalysis07 := &entity.EmotionAnalysisResults{
		InputText: 			"I'm so proud of myself for completing the marathon!",
		AnalysisTimestamp: 	time.Date(2025, 7, 21, 16, 10, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"pride",
		TranslatedText:		"",
		DiaryID:  			7,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis07, &entity.EmotionAnalysisResults{DiaryID: 7})

	EmotionsAnalysis08 := &entity.EmotionAnalysisResults{
		InputText: 			"I'm curious about this new hobby. I wonder what it would be like to try it.",
		AnalysisTimestamp: 	time.Date(2025, 7, 22, 11, 45, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"curiosity",
		TranslatedText:		"",
		DiaryID:  			8,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis08, &entity.EmotionAnalysisResults{DiaryID: 8})

	EmotionsAnalysis09 := &entity.EmotionAnalysisResults{
		InputText: 			"The traffic jam made me so angry today. Such a waste of time!",
		AnalysisTimestamp: 	time.Date(2025, 7, 23, 8, 30, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"anger",
		TranslatedText:		"",
		DiaryID:  			9,      	
		ThoughtRecordID:	4,
   	}
	db.FirstOrCreate(&EmotionsAnalysis09, &entity.EmotionAnalysisResults{DiaryID: 9})

	EmotionsAnalysis10 := &entity.EmotionAnalysisResults{
		InputText: 			"Finally finished that big project! What a relief to have it done.",
		AnalysisTimestamp: 	time.Date(2025, 7, 24, 17, 0, 0, 0, utcPlus7),
		Modelversion:		"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:		"relief",
		TranslatedText:		"",
		DiaryID:  			10,      	
		ThoughtRecordID:	0,
   	}
	db.FirstOrCreate(&EmotionsAnalysis10, &entity.EmotionAnalysisResults{DiaryID: 10})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 1 (excitement)
	SubEmotionsAnalysis01 := &entity.SubEmotionAnalysis{
		Score: 				0.8478781580924988,
		ConfidencePercentage: 84.78781580924988,
		EmotionAnalysisResultsID: 1,      	
		EmotionsID:			10, // excitement
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis01, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1, EmotionsID: 10})

	SubEmotionsAnalysis02 := &entity.SubEmotionAnalysis{
		Score: 				0.06275680661201477,
		ConfidencePercentage: 6.275680661201477,
		EmotionAnalysisResultsID: 1,      	
		EmotionsID:			11, // joy
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis02, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1, EmotionsID: 11})

	SubEmotionsAnalysis03 := &entity.SubEmotionAnalysis{
		Score: 				0.04521503567309475,
		ConfidencePercentage: 4.521503567309475,
		EmotionAnalysisResultsID: 1,      	
		EmotionsID:			14, // optimism
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis03, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1, EmotionsID: 14})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 2 (disappointment)
	SubEmotionsAnalysis04 := &entity.SubEmotionAnalysis{
		Score: 				0.7234567890123456,
		ConfidencePercentage: 72.34567890123456,
		EmotionAnalysisResultsID: 2,      	
		EmotionsID:			20, // disappointment
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis04, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 2, EmotionsID: 20})

	SubEmotionsAnalysis05 := &entity.SubEmotionAnalysis{
		Score: 				0.1432109876543210,
		ConfidencePercentage: 14.32109876543210,
		EmotionAnalysisResultsID: 2,      	
		EmotionsID:			25, // sadness
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis05, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 2, EmotionsID: 25})

	SubEmotionsAnalysis06 := &entity.SubEmotionAnalysis{
		Score: 				0.0876543210987654,
		ConfidencePercentage: 8.76543210987654,
		EmotionAnalysisResultsID: 2,      	
		EmotionsID:			21, // disapproval
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis06, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 2, EmotionsID: 21})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 3 (gratitude)
	SubEmotionsAnalysis07 := &entity.SubEmotionAnalysis{
		Score: 				0.9012345678901234,
		ConfidencePercentage: 90.12345678901234,
		EmotionAnalysisResultsID: 3,      	
		EmotionsID:			12, // gratitude
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis07, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 3, EmotionsID: 12})

	SubEmotionsAnalysis08 := &entity.SubEmotionAnalysis{
		Score: 				0.0567890123456789,
		ConfidencePercentage: 5.67890123456789,
		EmotionAnalysisResultsID: 3,      	
		EmotionsID:			13, // love
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis08, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 3, EmotionsID: 13})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 4 (nervousness)
	SubEmotionsAnalysis09 := &entity.SubEmotionAnalysis{
		Score: 				0.6789012345678901,
		ConfidencePercentage: 67.89012345678901,
		EmotionAnalysisResultsID: 4,      	
		EmotionsID:			24, // nervousness
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis09, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 4, EmotionsID: 24})

	SubEmotionsAnalysis10 := &entity.SubEmotionAnalysis{
		Score: 				0.2345678901234567,
		ConfidencePercentage: 23.45678901234567,
		EmotionAnalysisResultsID: 4,      	
		EmotionsID:			22, // fear
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis10, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 4, EmotionsID: 22})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 5 (love)
	SubEmotionsAnalysis11 := &entity.SubEmotionAnalysis{
		Score: 				0.8765432109876543,
		ConfidencePercentage: 87.65432109876543,
		EmotionAnalysisResultsID: 5,      	
		EmotionsID:			13, // love
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis11, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 5, EmotionsID: 13})

	SubEmotionsAnalysis12 := &entity.SubEmotionAnalysis{
		Score: 				0.0987654321098765,
		ConfidencePercentage: 9.87654321098765,
		EmotionAnalysisResultsID: 5,      	
		EmotionsID:			11, // joy
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis12, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 5, EmotionsID: 11})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 6 (embarrassment)
	SubEmotionsAnalysis13 := &entity.SubEmotionAnalysis{
		Score: 				0.7654321098765432,
		ConfidencePercentage: 76.54321098765432,
		EmotionAnalysisResultsID: 6,      	
		EmotionsID:			23, // embarrassment
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis13, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 6, EmotionsID: 23})

	SubEmotionsAnalysis14 := &entity.SubEmotionAnalysis{
		Score: 				0.1543210987654321,
		ConfidencePercentage: 15.43210987654321,
		EmotionAnalysisResultsID: 6,      	
		EmotionsID:			26, // remorse
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis14, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 6, EmotionsID: 26})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 7 (pride)
	SubEmotionsAnalysis15 := &entity.SubEmotionAnalysis{
		Score: 				0.8901234567890123,
		ConfidencePercentage: 89.01234567890123,
		EmotionAnalysisResultsID: 7,      	
		EmotionsID:			15, // pride
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis15, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 7, EmotionsID: 15})

	SubEmotionsAnalysis16 := &entity.SubEmotionAnalysis{
		Score: 				0.0678901234567890,
		ConfidencePercentage: 6.78901234567890,
		EmotionAnalysisResultsID: 7,      	
		EmotionsID:			11, // joy
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis16, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 7, EmotionsID: 11})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 8 (curiosity)
	SubEmotionsAnalysis17 := &entity.SubEmotionAnalysis{
		Score: 				0.8123456789012345,
		ConfidencePercentage: 81.23456789012345,
		EmotionAnalysisResultsID: 8,      	
		EmotionsID:			8, // curiosity
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis17, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 8, EmotionsID: 8})

	SubEmotionsAnalysis18 := &entity.SubEmotionAnalysis{
		Score: 				0.1234567890123456,
		ConfidencePercentage: 12.34567890123456,
		EmotionAnalysisResultsID: 8,      	
		EmotionsID:			10, // excitement
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis18, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 8, EmotionsID: 10})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 9 (anger)
	SubEmotionsAnalysis19 := &entity.SubEmotionAnalysis{
		Score: 				0.7890123456789012,
		ConfidencePercentage: 78.90123456789012,
		EmotionAnalysisResultsID: 9,      	
		EmotionsID:			17, // anger
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis19, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 9, EmotionsID: 17})

	SubEmotionsAnalysis20 := &entity.SubEmotionAnalysis{
		Score: 				0.1345678901234567,
		ConfidencePercentage: 13.45678901234567,
		EmotionAnalysisResultsID: 9,      	
		EmotionsID:			18, // annoyance
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis20, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 9, EmotionsID: 18})

	// SubEmotionAnalysis สำหรับ EmotionAnalysisResults ID 10 (relief)
	SubEmotionsAnalysis21 := &entity.SubEmotionAnalysis{
		Score: 				0.8567890123456789,
		ConfidencePercentage: 85.67890123456789,
		EmotionAnalysisResultsID: 10,      	
		EmotionsID:			16, // relief
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis21, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 10, EmotionsID: 16})

	SubEmotionsAnalysis22 := &entity.SubEmotionAnalysis{
		Score: 				0.0987654321098765,
		ConfidencePercentage: 9.87654321098765,
		EmotionAnalysisResultsID: 10,      	
		EmotionsID:			14, // optimism
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis22, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 10, EmotionsID: 14})
}