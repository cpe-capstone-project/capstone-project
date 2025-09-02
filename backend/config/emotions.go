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
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)
	timetestlayout := time.Date(2025, 7, 15, 12, 00, 0, 0, utcPlus7)
	EmotionsAnalysisHappy := &entity.EmotionAnalysisResults{
		InputText: 			"I'm so excited about my new job!",
		AnalysisTimestamp: timetestlayout,
		Modelversion:	"SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:	"excitement",
		TranslatedText:"",
		DiaryID:  	1,      	
		ThoughtRecordID:1,
   	}
	db.FirstOrCreate(&EmotionsAnalysisHappy, &entity.EmotionAnalysisResults{InputText: "I'm so excited about my new job!"})

	SubEmotionsAnalysis01 := &entity.SubEmotionAnalysis{
		Score: 			0.8478781580924988,
		ConfidencePercentage: 84.78781580924988,
		EmotionAnalysisResultsID:  	1,      	
		EmotionsID:10,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis01, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: 1})
	SubEmotionsAnalysis02 := &entity.SubEmotionAnalysis{
		Score: 			0.06275680661201477,
		ConfidencePercentage: 6.275680661201477,
		EmotionAnalysisResultsID:  	1,      	
		EmotionsID:11,
   	}
	db.FirstOrCreate(&SubEmotionsAnalysis02, &entity.SubEmotionAnalysis{ConfidencePercentage: 6.275680661201477})
}
