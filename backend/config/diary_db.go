package config

import (
	"capstone-project/entity"
	"fmt"
	"time"
)

func SetupDiaryDatabase() {
	db.AutoMigrate(
		&entity.Diaries{},
		&entity.DiarySummary{},
		&entity.DiarySummaryEntry{},
	)

	diaries := []entity.Diaries{
		{
			Title:         "วันที่รู้สึกโดดเดี่ยว",
			Content:       `<p>วันนี้ทั้งวันแทบไม่ได้คุยกับใครเลย ถึงแม้จะอยู่ท่ามกลางผู้คน แต่กลับรู้สึกเหมือนตัวเองล่องหน ไม่มีใครเห็นหรือสนใจว่าฉันอยู่ตรงนี้ มันทำให้รู้สึกเศร้าอย่างบอกไม่ถูก...</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -1), // เมื่อวาน,
			TagColor1:     "#FFC107",
			TagColor2:     "#FF9800",
			TagColor3:     "#FF5722",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่รู้สึกว่าตัวเองมีคุณค่า",
			Content:       `<p>วันนี้มีเพื่อนร่วมงานมาขอบคุณฉันสำหรับคำแนะนำที่ให้ไปเมื่อสัปดาห์ก่อน เขาบอกว่ามันช่วยเขาได้มาก คำพูดนั้นทำให้ฉันรู้สึกอุ่นใจ เหมือนความพยายามของฉันไม่ได้สูญเปล่า...</p>`,
			UpdatedAt:     time.Now(),
			TagColor1:     "#4CAF50",
			TagColor2:     "#8BC34A",
			TagColor3:     "#CDDC39",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่ได้เรียนรู้สิ่งใหม่",
			Content:       `<p>วันนี้ฉันได้ลองทำสิ่งใหม่ที่ไม่เคยทำมาก่อน แม้มันจะท้าทาย แต่ผลลัพธ์ที่ออกมาทำให้ฉันภูมิใจ การเรียนรู้ครั้งนี้ทำให้ฉันเชื่อมั่นว่า หากกล้าที่จะเริ่มต้น ฉันก็สามารถเติบโตได้เสมอ</p>`,
			UpdatedAt:     time.Now(),
			TagColor1:     "#9C27B0",
			TagColor2:     "#BA68C8",
			TagColor3:     "#E1BEE7",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่รู้สึกขอบคุณสิ่งรอบตัว",
			Content:       `<p>วันนี้ฉันได้ใช้เวลากับครอบครัวและเพื่อน ๆ ช่วงเวลาธรรมดาเหล่านี้ทำให้ฉันตระหนักว่า ความสุขไม่ได้อยู่ที่สิ่งใหญ่โต แต่อยู่ที่การได้ใช้เวลากับคนที่เรารักและรักเรา</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -1), // เมื่อวาน,
			TagColor1:     "#F44336",
			TagColor2:     "#E57373",
			TagColor3:     "#FFCDD2",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่รู้สึกว่าตมีแรงบังดาลใจ",
			Content:       `<p>วันนี้ฉันได้ลองทำสิ่งใหม่ที่ไม่เคยทำมาก่อน แม้ตอนแรกจะรู้สึกกังวล แต่ผลลัพธ์ออกมาดีกว่าที่คิด การก้าวออกจากพื้นที่ปลอดภัยทำให้ฉันมั่นใจมากขึ้น...</p>`,
			UpdatedAt:     time.Now(),
			TagColor1:     "#4CAF50",
			TagColor2:     "#FF9800",
			TagColor3:     "#FFC107",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่กลัวอนาคต",
			Content:       `<p>คืนนี้นอนไม่หลับเลย คิดมากเรื่องอนาคต กลัวว่าจะไม่มีงานทำ กลัวว่าจะอยู่คนเดียวไปตลอด ความไม่แน่นอนทำให้รู้สึกเหมือนยืนอยู่บนหน้าผา...</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -1), // เมื่อวาน,
			TagColor1:     "#E91E63",
			TagColor2:     "#9C27B0",
			TagColor3:     "#673AB7",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่กล้าพูดในสิ่งที่คิด",
			Content:       `<p>วันนี้ฉันกล้าพูดในที่ประชุม แม้จะรู้สึกประหม่า แต่ฉันก็ทำได้ และได้รับคำชมจากหัวหน้าด้วย รู้สึกภูมิใจที่กล้าแสดงความเห็น แม้จะเป็นก้าวเล็กๆ แต่ก็เป็นก้าวที่สำคัญ...</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -3), // 3 วันก่อน (ในสัปดาห์นี้),
			TagColor1:     "#03A9F4",
			TagColor2:     "#00BCD4",
			TagColor3:     "#009688",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่เศร้าโดยไม่มีเหตุผล",
			Content:       `<p>ทั้งวันไม่มีอะไรผิดปกติ แต่ฉันกลับรู้สึกเศร้าลึกๆ เหมือนมีเมฆหมอกคลุมอยู่ในใจ พยายามหาเหตุผลแต่ก็หาไม่เจอ มันยิ่งทำให้รู้สึกแย่ลงไปอีก...</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -6), // 6 วันก่อน (ในสัปดาห์นี้),
			TagColor1:     "#795548",
			TagColor2:     "#6D4C41",
			TagColor3:     "#3E2723",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่ได้รับกำลังใจจากคนแปลกหน้า",
			Content:       `<p>วันนี้ระหว่างรอรถเมล์ มีผู้หญิงคนหนึ่งเข้ามาทักและยิ้มให้ฉัน เธอบอกว่าเสื้อที่ฉันใส่น่ารักดี แค่นั้นเองแต่ทำให้วันทั้งวันของฉันสดใสขึ้นอย่างไม่น่าเชื่อ...</p>`,
			UpdatedAt:     time.Now().AddDate(0, 0, -10), // 10 วันก่อน (ในเดือนนี้),
			TagColor1:     "#FFEB3B",
			TagColor2:     "#FFC107",
			TagColor3:     "#FF9800",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่คิดถึงบ้าน",
			Content:       `<p>วันนี้เห็นข่าวเกี่ยวกับบ้านเกิด ทำให้คิดถึงครอบครัว คิดถึงอาหาร คิดถึงบรรยากาศเดิมๆ น้ำตาไหลโดยไม่รู้ตัว ความคิดถึงนั้นอบอุ่นและปวดร้าวในเวลาเดียวกัน...</p>`,
			UpdatedAt:     time.Now().AddDate(0, -1, -2), // เดือนที่แล้ว,
			TagColor1:     "#2196F3",
			TagColor2:     "#03A9F4",
			TagColor3:     "#00BCD4",
			Confirmed:     true,
			TherapyCaseID: 1,
		},
		{
			Title:         "วันที่ให้อภัยตัวเอง",
			Content:       `<p>ฉันเผลอพูดไม่ดีใส่เพื่อนเมื่อวาน วันนี้ขอโทษเขาและเขาก็ให้อภัย ตอนนี้ฉันกำลังพยายามให้อภัยตัวเองเช่นกัน เพราะรู้ว่าทุกคนก็เคยทำผิด และเราเรียนรู้จากมันได้...</p>`,
			UpdatedAt:     time.Now().AddDate(0, -2, 0), // 2 เดือนที่แล้ว,
			TagColor1:     "#8BC34A",
			TagColor2:     "#CDDC39",
			TagColor3:     "#FFEB3B",
			Confirmed:     true,
			TherapyCaseID: 2,
		},
		{
			Title:         "วันที่รู้สึกไร้ค่า",
			Content:       `<p>วันนี้มีคนตำหนิฉันเรื่องงาน แม้มันจะไม่ใช่เรื่องใหญ่ แต่กลับรู้สึกว่าตัวเองแย่มาก มันไปกระตุกความรู้สึกเก่าๆ ที่เคยมีว่า “ฉันไม่มีค่า” ขึ้นมาอีกครั้ง...</p>`,
			UpdatedAt:     time.Now().AddDate(0, -3, 5), // 3 เดือนก่อน,
			TagColor1:     "#9E9E9E",
			TagColor2:     "#607D8B",
			TagColor3:     "#546E7A",
			Confirmed:     true,
			TherapyCaseID: 2,
		},
		{
			Title:         "วันที่เห็นแสงสว่างเล็กๆ",
			Content:       `<p>แม้จะเป็นวันธรรมดา แต่วันนี้มีบางอย่างในใจที่ต่างออกไป เหมือนเริ่มเห็นแสงเล็กๆ ในความมืด รู้สึกว่าตัวเองกำลังเดินหน้า แม้จะช้า แต่ก็ยังเดินอยู่...</p>`,
			UpdatedAt:     time.Now().AddDate(-1, 0, 0), // 1 ปีก่อน,
			TagColor1:     "#4CAF50",
			TagColor2:     "#81C784",
			TagColor3:     "#A5D6A7",
			Confirmed:     true,
			TherapyCaseID: 2,
		},
	}
	for d := range diaries {
		db.FirstOrCreate(&diaries[d], entity.Diaries{Title: diaries[d].Title})
	}

	fmt.Println("Diary data has been added to the database.")

}
