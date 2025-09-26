package config

import (
	"capstone-project/entity"
	"time"
)

func SetupEmotionForDiaryDatabase() {
	utcPlus7 := time.FixedZone("UTC+7", 7*60*60)
	
	// Diary 1: วันที่รู้สึกโดดเดี่ยว (เมื่อวาน)
	timeLayout1 := time.Date(2025, 9, 25, 14, 30, 0, 0, utcPlus7)
	EmotionAnalysisDiary1 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ทั้งวันแทบไม่ได้คุยกับใครเลย ถึงแม้จะอยู่ท่ามกลางผู้คน แต่กลับรู้สึกเหมือนตัวเองล่องหน ไม่มีใครเห็นหรือสนใจว่าฉันอยู่ตรงนี้ มันทำให้รู้สึกเศร้าอย่างบอกไม่ถูก...",
		TranslatedText:    "Today I hardly talked to anyone all day. Even though I was surrounded by people, I felt invisible. No one saw or cared that I was here. It made me feel indescribably sad...",
		AnalysisTimestamp: timeLayout1,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "sadness",
		DiaryID:           1,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary1, &entity.EmotionAnalysisResults{DiaryID: 1})
	
	// Sub emotions for Diary 1
	SubEmotion1_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8245,
		ConfidencePercentage:      82.45,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary1.ID,
		EmotionsID:                27, // sadness
	}
	db.FirstOrCreate(&SubEmotion1_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary1.ID, EmotionsID: 27})
	
	SubEmotion1_2 := &entity.SubEmotionAnalysis{
		Score:                     0.6432,
		ConfidencePercentage:      64.32,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary1.ID,
		EmotionsID:                24, // grief
	}
	db.FirstOrCreate(&SubEmotion1_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary1.ID, EmotionsID: 24})
	
	SubEmotion1_3 := &entity.SubEmotionAnalysis{
		Score:                     0.3891,
		ConfidencePercentage:      38.91,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary1.ID,
		EmotionsID:                19, // disappointment
	}
	db.FirstOrCreate(&SubEmotion1_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary1.ID, EmotionsID: 19})

	// Diary 2: วันที่รู้สึกว่าตัวเองมีคุณค่า (วันนี้)
	timeLayout2 := time.Date(2025, 9, 26, 16, 15, 0, 0, utcPlus7)
	EmotionAnalysisDiary2 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้มีเพื่อนร่วมงานมาขอบคุณฉันสำหรับคำแนะนำที่ให้ไปเมื่อสัปดาห์ก่อน เขาบอกว่ามันช่วยเขาได้มาก คำพูดนั้นทำให้ฉันรู้สึกอุ่นใจ เหมือนความพยายามของฉันไม่ได้สูญเปล่า...",
		TranslatedText:    "Today a coworker thanked me for advice I gave last week. He said it helped him a lot. Those words made me feel warm, like my efforts weren't in vain...",
		AnalysisTimestamp: timeLayout2,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "gratitude",
		DiaryID:           2,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary2, &entity.EmotionAnalysisResults{DiaryID: 2})
	
	// Sub emotions for Diary 2
	SubEmotion2_1 := &entity.SubEmotionAnalysis{
		Score:                     0.7854,
		ConfidencePercentage:      78.54,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary2.ID,
		EmotionsID:                9, // gratitude
	}
	db.FirstOrCreate(&SubEmotion2_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary2.ID, EmotionsID: 9})
	
	SubEmotion2_2 := &entity.SubEmotionAnalysis{
		Score:                     0.6923,
		ConfidencePercentage:      69.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary2.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion2_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary2.ID, EmotionsID: 10})
	
	SubEmotion2_3 := &entity.SubEmotionAnalysis{
		Score:                     0.5847,
		ConfidencePercentage:      58.47,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary2.ID,
		EmotionsID:                14, // pride
	}
	db.FirstOrCreate(&SubEmotion2_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary2.ID, EmotionsID: 14})

	// Diary 3: วันที่ได้เรียนรู้สิ่งใหม่ (วันนี้)
	timeLayout3 := time.Date(2025, 9, 26, 18, 45, 0, 0, utcPlus7)
	EmotionAnalysisDiary3 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ฉันได้ลองทำสิ่งใหม่ที่ไม่เคยทำมาก่อน แม้มันจะท้าทาย แต่ผลลัพธ์ที่ออกมาทำให้ฉันภูมิใจ การเรียนรู้ครั้งนี้ทำให้ฉันเชื่อมั่นว่า หากกล้าที่จะเริ่มต้น ฉันก็สามารถเติบโตได้เสมอ",
		TranslatedText:    "Today I tried something new that I had never done before. Even though it was challenging, the results made me proud. This learning experience made me believe that if I dare to start, I can always grow.",
		AnalysisTimestamp: timeLayout3,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "pride",
		DiaryID:           3,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary3, &entity.EmotionAnalysisResults{DiaryID: 3})
	
	// Sub emotions for Diary 3
	SubEmotion3_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8756,
		ConfidencePercentage:      87.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary3.ID,
		EmotionsID:                14, // pride
	}
	db.FirstOrCreate(&SubEmotion3_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary3.ID, EmotionsID: 14})
	
	SubEmotion3_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7234,
		ConfidencePercentage:      72.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary3.ID,
		EmotionsID:                8, // excitement
	}
	db.FirstOrCreate(&SubEmotion3_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary3.ID, EmotionsID: 8})
	
	SubEmotion3_3 := &entity.SubEmotionAnalysis{
		Score:                     0.6145,
		ConfidencePercentage:      61.45,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary3.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion3_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary3.ID, EmotionsID: 10})

	// Diary 4: วันที่รู้สึกขอบคุณสิ่งรอบตัว (เมื่อวาน)
	timeLayout4 := time.Date(2025, 9, 25, 20, 0, 0, 0, utcPlus7)
	EmotionAnalysisDiary4 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ฉันได้ใช้เวลากับครอบครัวและเพื่อน ๆ ช่วงเวลาธรรมดาเหล่านี้ทำให้ฉันตระหนักว่า ความสุขไม่ได้อยู่ที่สิ่งใหญ่โต แต่อยู่ที่การได้ใช้เวลากับคนที่เรารักและรักเรา",
		TranslatedText:    "Today I spent time with family and friends. These ordinary moments made me realize that happiness isn't in big things, but in spending time with people we love and who love us.",
		AnalysisTimestamp: timeLayout4,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "love",
		DiaryID:           4,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary4, &entity.EmotionAnalysisResults{DiaryID: 4})
	
	// Sub emotions for Diary 4
	SubEmotion4_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8934,
		ConfidencePercentage:      89.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary4.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion4_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary4.ID, EmotionsID: 10})
	
	SubEmotion4_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7623,
		ConfidencePercentage:      76.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary4.ID,
		EmotionsID:                12, // optimism
	}
	db.FirstOrCreate(&SubEmotion4_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary4.ID, EmotionsID: 12})
	
	// SubEmotion4_3 := &entity.SubEmotionAnalysis{
	// 	Score:                     0.6456,
	// 	ConfidencePercentage:      64.56,
	// 	EmotionAnalysisResultsID:  EmotionAnalysisDiary4.ID,
	// 	EmotionsID:                9, // joy
	// }
	// db.FirstOrCreate(&SubEmotion4_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary4.ID, EmotionsID: 9})

	// Diary 5: วันที่รู้สึกว่าตมีแรงบังดาลใจ (วันนี้)
	timeLayout5 := time.Date(2025, 9, 26, 21, 30, 0, 0, utcPlus7)
	EmotionAnalysisDiary5 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ฉันได้ลองทำสิ่งใหม่ที่ไม่เคยทำมาก่อน แม้ตอนแรกจะรู้สึกกังวล แต่ผลลัพธ์ออกมาดีกว่าที่คิด การก้าวออกจากพื้นที่ปลอดภัยทำให้ฉันมั่นใจมากขึ้น...",
		TranslatedText:    "Today I tried something new that I had never done before. Even though I felt anxious at first, the results turned out better than expected. Stepping out of my comfort zone made me more confident...",
		AnalysisTimestamp: timeLayout5,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "excitement",
		DiaryID:           5,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary5, &entity.EmotionAnalysisResults{DiaryID: 5})
	
	// Sub emotions for Diary 5
	SubEmotion5_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8123,
		ConfidencePercentage:      81.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary5.ID,
		EmotionsID:                7, // desire
	}
	db.FirstOrCreate(&SubEmotion5_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary5.ID, EmotionsID: 7})
	
	SubEmotion5_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7345,
		ConfidencePercentage:      73.45,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary5.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion5_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary5.ID, EmotionsID: 10})
	
	SubEmotion5_3 := &entity.SubEmotionAnalysis{
		Score:                     0.5234,
		ConfidencePercentage:      52.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary5.ID,
		EmotionsID:                14, // pride
	}
	db.FirstOrCreate(&SubEmotion5_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary5.ID, EmotionsID: 14})

	// Diary 6: วันที่กลัวอนาคต (เมื่อวาน)
	timeLayout6 := time.Date(2025, 9, 25, 23, 45, 0, 0, utcPlus7)
	EmotionAnalysisDiary6 := &entity.EmotionAnalysisResults{
		InputText:         "คืนนี้นอนไม่หลับเลย คิดมากเรื่องอนาคต กลัวว่าจะไม่มีงานทำ กลัวว่าจะอยู่คนเดียวไปตลอด ความไม่แน่นอนทำให้รู้สึกเหมือนยืนอยู่บนหน้าผา...",
		TranslatedText:    "I couldn't sleep tonight. Overthinking about the future. Afraid of being unemployed, afraid of being alone forever. The uncertainty makes me feel like I'm standing on a cliff...",
		AnalysisTimestamp: timeLayout6,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "fear",
		DiaryID:           6,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary6, &entity.EmotionAnalysisResults{DiaryID: 6})
	
	// Sub emotions for Diary 6
	SubEmotion6_1 := &entity.SubEmotionAnalysis{
		Score:                     0.9123,
		ConfidencePercentage:      91.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary6.ID,
		EmotionsID:                23, // fear
	}
	db.FirstOrCreate(&SubEmotion6_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary6.ID, EmotionsID: 23})
	
	SubEmotion6_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7865,
		ConfidencePercentage:      78.65,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary6.ID,
		EmotionsID:                25, // nervousness
	}
	db.FirstOrCreate(&SubEmotion6_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary6.ID, EmotionsID: 25})
	
	SubEmotion6_3 := &entity.SubEmotionAnalysis{
		Score:                     0.6734,
		ConfidencePercentage:      67.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary6.ID,
		EmotionsID:                27, // sadness
	}
	db.FirstOrCreate(&SubEmotion6_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary6.ID, EmotionsID: 27})

	// Diary 7: วันที่กล้าพูดในสิ่งที่คิด (3 วันก่อน)
	timeLayout7 := time.Date(2025, 9, 23, 14, 0, 0, 0, utcPlus7)
	EmotionAnalysisDiary7 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ฉันกล้าพูดในที่ประชุม แม้จะรู้สึกประหม่า แต่ฉันก็ทำได้ และได้รับคำชมจากหัวหน้าด้วย รู้สึกภูมิใจที่กล้าแสดงความเห็น แม้จะเป็นก้าวเล็กๆ แต่ก็เป็นก้าวที่สำคัญ...",
		TranslatedText:    "Today I dared to speak in a meeting. Although I felt nervous, I did it and received praise from my boss. I feel proud that I dared to express my opinion. Even though it was a small step, it was an important step...",
		AnalysisTimestamp: timeLayout7,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "pride",
		DiaryID:           7,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary7, &entity.EmotionAnalysisResults{DiaryID: 7})
	
	// Sub emotions for Diary 7
	SubEmotion7_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8567,
		ConfidencePercentage:      85.67,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary7.ID,
		EmotionsID:                14, // pride
	}
	db.FirstOrCreate(&SubEmotion7_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary7.ID, EmotionsID: 14})
	
	SubEmotion7_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7234,
		ConfidencePercentage:      72.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary7.ID,
		EmotionsID:                4, // approval
	}
	db.FirstOrCreate(&SubEmotion7_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary7.ID, EmotionsID: 4})
	
	SubEmotion7_3 := &entity.SubEmotionAnalysis{
		Score:                     0.5845,
		ConfidencePercentage:      58.45,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary7.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion7_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary7.ID, EmotionsID: 10})

	// Diary 8: วันที่เศร้าโดยไม่มีเหตุผล (6 วันก่อน)
	timeLayout8 := time.Date(2025, 9, 20, 16, 30, 0, 0, utcPlus7)
	EmotionAnalysisDiary8 := &entity.EmotionAnalysisResults{
		InputText:         "ทั้งวันไม่มีอะไรผิดปกติ แต่ฉันกลับรู้สึกเศร้าลึกๆ เหมือนมีเมฆหมอกคลุมอยู่ในใจ พยายามหาเหตุผลแต่ก็หาไม่เจอ มันยิ่งทำให้รู้สึกแย่ลงไปอีก...",
		TranslatedText:    "Nothing unusual happened all day, but I felt deeply sad. Like a fog was covering my heart. I tried to find a reason but couldn't. It made me feel even worse...",
		AnalysisTimestamp: timeLayout8,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "sadness",
		DiaryID:           8,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary8, &entity.EmotionAnalysisResults{DiaryID: 8})
	
	// Sub emotions for Diary 8
	SubEmotion8_1 := &entity.SubEmotionAnalysis{
		Score:                     0.9234,
		ConfidencePercentage:      92.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary8.ID,
		EmotionsID:                27, // sadness
	}
	db.FirstOrCreate(&SubEmotion8_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary8.ID, EmotionsID: 27})
	
	SubEmotion8_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7456,
		ConfidencePercentage:      74.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary8.ID,
		EmotionsID:                17, // confusion
	}
	db.FirstOrCreate(&SubEmotion8_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary8.ID, EmotionsID: 17})
	
	SubEmotion8_3 := &entity.SubEmotionAnalysis{
		Score:                     0.6123,
		ConfidencePercentage:      61.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary8.ID,
		EmotionsID:                18, // disappointment
	}
	db.FirstOrCreate(&SubEmotion8_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary8.ID, EmotionsID: 18})

	// Diary 9: วันที่ได้รับกำลังใจจากคนแปลกหน้า (10 วันก่อน)
	timeLayout9 := time.Date(2025, 9, 16, 8, 45, 0, 0, utcPlus7)
	EmotionAnalysisDiary9 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้ระหว่างรอรถเมล์ มีผู้หญิงคนหนึ่งเข้ามาทักและยิ้มให้ฉัน เธอบอกว่าเสื้อที่ฉันใส่น่ารักดี แค่นั้นเองแต่ทำให้วันทั้งวันของฉันสดใสขึ้นอย่างไม่น่าเชื่อ...",
		TranslatedText:    "Today while waiting for the bus, a woman came up and smiled at me. She said my shirt was cute. Just that, but it made my whole day incredibly brighter...",
		AnalysisTimestamp: timeLayout9,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "joy",
		DiaryID:           9,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary9, &entity.EmotionAnalysisResults{DiaryID: 9})
	
	// Sub emotions for Diary 9
	SubEmotion9_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8456,
		ConfidencePercentage:      84.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary9.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion9_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary9.ID, EmotionsID: 10})
	
	SubEmotion9_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7234,
		ConfidencePercentage:      72.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary9.ID,
		EmotionsID:                9, // gratitude
	}
	db.FirstOrCreate(&SubEmotion9_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary9.ID, EmotionsID: 9})
	
	// SubEmotion9_3 := &entity.SubEmotionAnalysis{
	// 	Score:                     0.6789,
	// 	ConfidencePercentage:      67.89,
	// 	EmotionAnalysisResultsID:  EmotionAnalysisDiary9.ID,
	// 	EmotionsID:                2, // amusement
	// }
	// db.FirstOrCreate(&SubEmotion9_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary9.ID, EmotionsID: 2})

	// Diary 10: วันที่คิดถึงบ้าน (เดือนที่แล้ว)
	timeLayout10 := time.Date(2025, 8, 24, 19, 0, 0, 0, utcPlus7)
	EmotionAnalysisDiary10 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้เห็นข่าวเกี่ยวกับบ้านเกิด ทำให้คิดถึงครอบครัว คิดถึงอาหาร คิดถึงบรรยากาศเดิมๆ น้ำตาไหลโดยไม่รู้ตัว ความคิดถึงนั้นอบอุ่นและปวดร้าวในเวลาเดียวกัน...",
		TranslatedText:    "Today I saw news about my hometown. It made me miss my family, miss the food, miss the old atmosphere. Tears flowed without me realizing. The longing was both warm and painful at the same time...",
		AnalysisTimestamp: timeLayout10,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "grief",
		DiaryID:           10,
		PatientID:         1,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary10, &entity.EmotionAnalysisResults{DiaryID: 10})
	
	// Sub emotions for Diary 10
	SubEmotion10_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8234,
		ConfidencePercentage:      82.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary10.ID,
		EmotionsID:                24, // grief
	}
	db.FirstOrCreate(&SubEmotion10_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary10.ID, EmotionsID: 24})
	
	SubEmotion10_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7456,
		ConfidencePercentage:      74.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary10.ID,
		EmotionsID:                27, // sadness
	}
	db.FirstOrCreate(&SubEmotion10_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary10.ID, EmotionsID: 27})
	
	// SubEmotion10_3 := &entity.SubEmotionAnalysis{
	// 	Score:                     0.6123,
	// 	ConfidencePercentage:      61.23,
	// 	EmotionAnalysisResultsID:  EmotionAnalysisDiary10.ID,
	// 	EmotionsID:                10, // love (warm feeling for family)
	// }
	// db.FirstOrCreate(&SubEmotion10_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary10.ID, EmotionsID: 10})

	// Diary 11: วันที่ให้อภัยตัวเอง (2 เดือนที่แล้ว)
	timeLayout11 := time.Date(2025, 7, 26, 15, 30, 0, 0, utcPlus7)
	EmotionAnalysisDiary11 := &entity.EmotionAnalysisResults{
		InputText:         "ฉันเผลอพูดไม่ดีใส่เพื่อนเมื่อวาน วันนี้ขอโทษเขาและเขาก็ให้อภัย ตอนนี้ฉันกำลังพยายามให้อภัยตัวเองเช่นกัน เพราะรู้ว่าทุกคนก็เคยทำผิด และเราเรียนรู้จากมันได้...",
		TranslatedText:    "I accidentally said something hurtful to my friend yesterday. Today I apologized to him and he forgave me. Now I'm trying to forgive myself too, because I know everyone makes mistakes, and we can learn from them...",
		AnalysisTimestamp: timeLayout11,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "relief",
		DiaryID:           11,
		PatientID:         2,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary11, &entity.EmotionAnalysisResults{DiaryID: 11})
	
	// Sub emotions for Diary 11
	SubEmotion11_1 := &entity.SubEmotionAnalysis{
		Score:                     0.7845,
		ConfidencePercentage:      78.45,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary11.ID,
		EmotionsID:                15, // relief
	}
	db.FirstOrCreate(&SubEmotion11_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary11.ID, EmotionsID: 15})
	
	SubEmotion11_2 := &entity.SubEmotionAnalysis{
		Score:                     0.6789,
		ConfidencePercentage:      67.89,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary11.ID,
		EmotionsID:                9, // gratitude
	}
	db.FirstOrCreate(&SubEmotion11_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary11.ID, EmotionsID: 9})
	
	SubEmotion11_3 := &entity.SubEmotionAnalysis{
		Score:                     0.5234,
		ConfidencePercentage:      52.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary11.ID,
		EmotionsID:                26, // remorse (initial feeling)
	}
	db.FirstOrCreate(&SubEmotion11_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary11.ID, EmotionsID: 26})

	// Diary 12: วันที่รู้สึกไร้ค่า (3 เดือนก่อน)
	timeLayout12 := time.Date(2025, 6, 21, 17, 15, 0, 0, utcPlus7)
	EmotionAnalysisDiary12 := &entity.EmotionAnalysisResults{
		InputText:         "วันนี้มีคนตำหนิฉันเรื่องงาน แม้มันจะไม่ใช่เรื่องใหญ่ แต่กลับรู้สึกว่าตัวเองแย่มาก มันไปกระตุกความรู้สึกเก่าๆ ที่เคยมีว่า \"ฉันไม่มีค่า\" ขึ้นมาอีกครั้ง...",
		TranslatedText:    "Today someone criticized my work. Even though it wasn't a big deal, I felt really bad about myself. It triggered old feelings I used to have that \"I'm worthless\" again...",
		AnalysisTimestamp: timeLayout12,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "sadness",
		DiaryID:           12,
		PatientID:         2,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary12, &entity.EmotionAnalysisResults{DiaryID: 12})
	
	// Sub emotions for Diary 12
	SubEmotion12_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8567,
		ConfidencePercentage:      85.67,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary12.ID,
		EmotionsID:                27, // sadness
	}
	db.FirstOrCreate(&SubEmotion12_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary12.ID, EmotionsID: 27})
	
	SubEmotion12_2 := &entity.SubEmotionAnalysis{
		Score:                     0.7234,
		ConfidencePercentage:      72.34,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary12.ID,
		EmotionsID:                21, // embarrassment
	}
	db.FirstOrCreate(&SubEmotion12_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary12.ID, EmotionsID: 21})
	
	SubEmotion12_3 := &entity.SubEmotionAnalysis{
		Score:                     0.6456,
		ConfidencePercentage:      64.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary12.ID,
		EmotionsID:                19, // disappointment
	}
	db.FirstOrCreate(&SubEmotion12_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary12.ID, EmotionsID: 19})

	// Diary 13: วันที่เห็นแสงสว่างเล็กๆ (1 ปีก่อน)
	timeLayout13 := time.Date(2024, 9, 26, 12, 0, 0, 0, utcPlus7)
	EmotionAnalysisDiary13 := &entity.EmotionAnalysisResults{
		InputText:         "แม้จะเป็นวันธรรมดา แต่วันนี้มีบางอย่างในใจที่ต่างออกไป เหมือนเริ่มเห็นแสงเล็กๆ ในความมืด รู้สึกว่าตัวเองกำลังเดินหน้า แม้จะช้า แต่ก็ยังเดินอยู่...",
		TranslatedText:    "Even though it was an ordinary day, there was something different in my heart today. Like I'm starting to see a small light in the darkness. I feel like I'm moving forward, even if slowly, but I'm still walking...",
		AnalysisTimestamp: timeLayout13,
		Modelversion:      "SamLowe/roberta-base-go_emotions",
		PrimaryEmotion:    "optimism",
		DiaryID:           13,
		PatientID:         2,
		ThoughtRecordID:   0,
	}
	db.FirstOrCreate(&EmotionAnalysisDiary13, &entity.EmotionAnalysisResults{DiaryID: 13})
	
	// Sub emotions for Diary 13
	SubEmotion13_1 := &entity.SubEmotionAnalysis{
		Score:                     0.8123,
		ConfidencePercentage:      81.23,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary13.ID,
		EmotionsID:                12, // optimism
	}
	db.FirstOrCreate(&SubEmotion13_1, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary13.ID, EmotionsID: 12})
	
	SubEmotion13_2 := &entity.SubEmotionAnalysis{
		Score:                     0.6789,
		ConfidencePercentage:      67.89,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary13.ID,
		EmotionsID:                13, // realization
	}
	db.FirstOrCreate(&SubEmotion13_2, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary13.ID, EmotionsID: 13})
	
	SubEmotion13_3 := &entity.SubEmotionAnalysis{
		Score:                     0.5456,
		ConfidencePercentage:      54.56,
		EmotionAnalysisResultsID:  EmotionAnalysisDiary13.ID,
		EmotionsID:                10, // joy
	}
	db.FirstOrCreate(&SubEmotion13_3, &entity.SubEmotionAnalysis{EmotionAnalysisResultsID: EmotionAnalysisDiary13.ID, EmotionsID: 10})
}