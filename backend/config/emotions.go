package config

import (
	 "time"
	"capstone-project/entity"
)

func SetupEmotionDatabase(){
	db.AutoMigrate(
       &entity.Emotions{},
	   &entity.EmotionAnalysisResults{},
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
	
   	db.FirstOrCreate(&EmotionsPositive, &entity.Emotions{Emotionsname: "positive"})
   	db.FirstOrCreate(&EmotionsNegative, &entity.Emotions{Emotionsname: "negative"})
	db.FirstOrCreate(&EmotionsNeutral, &entity.Emotions{Emotionsname: "neutral"})

	location, _ := time.LoadLocation("Asia/Bangkok")
	timestamp := time.Now().In(location)
	EmotionsAnalysisHappy := &entity.EmotionAnalysisResults{
		InputText: 			"ฉันรู้สึกมีความสุขมาก",
		AnalysisTimestamp: timestamp,
		Modelversion:	"Aiforthai1.0",
		SentimentScore:	1,
		DiaryID:  	1,      	
		EmotionsID: 1,
   	}
	db.FirstOrCreate(&EmotionsAnalysisHappy, &entity.EmotionAnalysisResults{Modelversion: "Aiforthai1.0"})
}
