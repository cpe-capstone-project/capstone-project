package diary

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /diaries?sort=updated_at&order=asc
func ListDiaries(c *gin.Context) {
	var diaries []entity.Diaries
	db := config.DB()

	sortField := c.DefaultQuery("sort", "updated_at")
	order := c.DefaultQuery("order", "desc")

	// ตรวจสอบว่า order มีค่าถูกต้องหรือไม่
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	var sortColumn string
	switch sortField {
	case "CreatedAt":
		sortColumn = "created_at"
	case "UpdatedAt":
		sortColumn = "updated_at"
	default:
		sortColumn = "updated_at" // fallback
	}
	db = db.Order(sortColumn + " " + order)

	results := db.Preload("TherapyCase").
		Preload("FeedbackDiary.Feedbacks.Psychologist").
		Preload("FeedbackDiary.Feedbacks.Patient").
		Preload("FeedbackDiary.Feedbacks.FeedbackType").
		Preload("FeedbackDiary.Feedbacks.FeedbackTime").
		Find(&diaries)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diaries)
}

// GET /diaries/patient/:patientId/therapy-case/:caseId?sort=updated_at&order=desc
func ListDiariesByPatientAndTherapyCase(c *gin.Context) {
	patientIDParam := c.Param("patientId")
	caseIDParam := c.Param("caseId")

	patientID, err := strconv.ParseUint(patientIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}

	therapyCaseID, err := strconv.ParseUint(caseIDParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid therapy case ID"})
		return
	}

	var diaries []entity.Diaries
	db := config.DB()

	// Sort
	sortField := c.DefaultQuery("sort", "updated_at")
	order := c.DefaultQuery("order", "desc")
	if order != "asc" && order != "desc" {
		order = "desc"
	}

	var sortColumn string
	switch sortField {
	case "CreatedAt":
		sortColumn = "diaries.created_at"
	case "UpdatedAt":
		sortColumn = "diaries.updated_at"
	default:
		sortColumn = "diaries.updated_at"
	}
	db = db.Order(sortColumn + " " + order)

	// Query
	result := db.Preload("TherapyCase").
		Preload("FeedbackDiary.Feedbacks.Psychologist").
		Preload("FeedbackDiary.Feedbacks.Patient").
		Preload("FeedbackDiary.Feedbacks.FeedbackType").
		Preload("FeedbackDiary.Feedbacks.FeedbackTime").
		Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
		Where("therapy_cases.id = ? AND therapy_cases.patient_id = ?", therapyCaseID, patientID).
		Find(&diaries)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, diaries)
}

// GET /diary/:id
func GetDiaryByID(c *gin.Context) {
	ID := c.Param("id")
	var diary entity.Diaries

	db := config.DB()
	results := db.Preload("TherapyCase").Preload("FeedbackDiary.Feedbacks.Psychologist").
		Preload("FeedbackDiary.Feedbacks.Patient").
		Preload("FeedbackDiary.Feedbacks.FeedbackType").
		Preload("FeedbackDiary.Feedbacks.FeedbackTime").First(&diary, ID)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})

		return
	}

	if diary.ID == 0 {
		c.JSON(http.StatusNoContent, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diary)
}

// POST /diary
func CreateDiary(c *gin.Context) {
	var diary entity.Diaries

	//bind เข้าตัวแปร diary
	if err := c.ShouldBindJSON(&diary); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// defaultColors := "#FFC107,#FF9800,#FF5722"
	defaultColor1 := "#FFC107"
	defaultColor2 := "#FF9800"
	defaultColor3 := "#FF5722"
	if diary.TagColor1 == "" && diary.TagColor2 == "" && diary.TagColor3 == "" {
		diary.TagColor1 = defaultColor1
		diary.TagColor2 = defaultColor2
		diary.TagColor3 = defaultColor3
	}

	db := config.DB()

	bc := entity.Diaries{
		Title:         diary.Title,
		Content:       diary.Content,
		// TagColors:     diary.TagColors,
		TagColor1:    diary.TagColor1,
		TagColor2:    diary.TagColor2,
		TagColor3:    diary.TagColor3,
		UpdatedAt:    time.Now(),
		Confirmed:     false,
		TherapyCaseID: diary.TherapyCaseID,
	}

	//บันทึก
	if err := db.Create(&bc).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bc)
}

// PATCH /diary/:id
func UpdateDiaryByID(c *gin.Context) {
	var diary entity.Diaries
	diaryID := c.Param("id")
	db := config.DB()

	result := db.First(&diary, diaryID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&diary); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	// defaultColors := "#FFC107,#FF9800,#FF5722"
	// if diary.TagColors == "" {
	// 	diary.TagColors = defaultColors
	// }
	defaultColor1 := "#FFC107"
	defaultColor2 := "#FF9800"
	defaultColor3 := "#FF5722"
	if diary.TagColor1 == "" && diary.TagColor2 == "" && diary.TagColor3 == "" {
		diary.TagColor1 = defaultColor1
		diary.TagColor2 = defaultColor2
		diary.TagColor3 = defaultColor3
	}

	if diary.Confirmed == false {
		diary.Confirmed = true
	}

	result = db.Save(&diary)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Update successful"})
}

// DELETE /diary/:id
func DeleteDiary(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if tx := db.Delete(&entity.Diaries{}, id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successful"})
}

// GET /diaries/latest?limit=5
func ListLatestDiaries(c *gin.Context) {
	var diaries []entity.Diaries
	db := config.DB()

	limitStr := c.DefaultQuery("limit", "5")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 5
	}

	if err := db.Order("updated_at desc").Limit(limit).Find(&diaries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, diaries)
}

// GET /diaries/count?year=2025&month=8
func CountDiariesByMonth(c *gin.Context) {
	db := config.DB()

	yearStr := c.DefaultQuery("year", "")
	monthStr := c.DefaultQuery("month", "")

	// ใช้เวลาปัจจุบันเป็นค่า default
	now := time.Now().UTC()
	year, month := now.Year(), now.Month()

	if yearStr != "" {
		if y, err := strconv.Atoi(yearStr); err == nil {
			year = y
		}
	}
	if monthStr != "" {
		if m, err := strconv.Atoi(monthStr); err == nil && m >= 1 && m <= 12 {
			month = time.Month(m)
		}
	}

	// คำนวณช่วงเริ่มต้น–สิ้นสุดของเดือน (UTC)
	start := time.Date(year, month, 1, 0, 0, 0, 0, time.UTC)
	end := start.AddDate(0, 1, 0) // ต้นเดือนถัดไป

	var count int64
	if err := db.Model(&entity.Diaries{}).
		Where("updated_at >= ? AND updated_at < ?", start, end).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": count,
		"year":  year,
		"month": int(month),
	})
}

// GET /diaries/home?tz=Asia/Bangkok
func GetHomeDiaries(c *gin.Context) {
	db := config.DB()

	tz := c.DefaultQuery("tz", "Asia/Bangkok")
	loc, err := time.LoadLocation(tz)
	if err != nil {
		loc, _ = time.LoadLocation("Asia/Bangkok")
	}

	now := time.Now().In(loc)

	// ====== วันนี้ ======
	startToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
	endToday := startToday.AddDate(0, 0, 1)

	// ====== สัปดาห์ที่ผ่านมา (จันทร์–อาทิตย์ของสัปดาห์ก่อน) ======
	weekday := int(now.Weekday())
	if weekday == 0 { // Sunday=0 -> ใช้ 7
		weekday = 7
	}
	// วันจันทร์ของ "สัปดาห์นี้"
	startThisWeek := time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, loc)
	// ช่วงของ "สัปดาห์ที่ผ่านมา"
	startPrevWeek := startThisWeek.AddDate(0, 0, -7) // จันทร์ที่แล้ว
	endPrevWeek := startThisWeek                     // ก่อนจันทร์นี้ (ไม่รวม)

	var todayDiary entity.Diaries
	var weekDiary entity.Diaries
	var todayList []entity.Diaries
	var weekList []entity.Diaries

	// ล่าสุดของ "วันนี้"
	_ = db.
		Where("updated_at >= ? AND updated_at < ?", startToday, endToday).
		Order("updated_at DESC").
		First(&todayDiary).Error

	// ทั้งหมดของ "วันนี้"
	_ = db.
		Where("updated_at >= ? AND updated_at < ?", startToday, endToday).
		Order("updated_at DESC").
		Find(&todayList).Error

	// ล่าสุดของ "สัปดาห์ที่ผ่านมา"
	_ = db.
		Where("updated_at >= ? AND updated_at < ?", startPrevWeek, endPrevWeek).
		Order("updated_at DESC").
		First(&weekDiary).Error

	// ทั้งหมดของ "สัปดาห์ที่ผ่านมา"
	_ = db.
		Where("updated_at >= ? AND updated_at < ?", startPrevWeek, endPrevWeek).
		Order("updated_at DESC").
		Find(&weekList).Error

	c.JSON(http.StatusOK, gin.H{
		"today":      nullIfZeroDiary(todayDiary),
		"week":       nullIfZeroDiary(weekDiary), // ใช้ key เดิม 'week' ให้ frontend เดิมใช้ได้
		"today_list": todayList,
		"week_list":  weekList,
	})
}

// helper: คืน nil ถ้า diary.ID == 0 จะได้ส่ง null ไปหน้าเว็บ
func nullIfZeroDiary(d entity.Diaries) interface{} {
	if d.ID == 0 {
		return nil
	}
	return d
}
// GET /patients/:patientId/diaries/count?scope=month&tz=Asia/Bangkok&year=2025&month=9
func CountDiariesByMonthForPatient(c *gin.Context) {
    db := config.DB()

    // --- patient id ---
    pidStr := c.Param("patientId")
    pid, err := strconv.ParseUint(pidStr, 10, 64)
    if err != nil || pid == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
        return
    }

    // --- timezone ---
    tz := c.DefaultQuery("tz", "Asia/Bangkok")
    loc, err := time.LoadLocation(tz)
    if err != nil {
        loc = time.FixedZone("Asia/Bangkok", 7*3600)
    }

    // --- scope (day, week, month) ---
    scope := c.DefaultQuery("scope", "month")

    now := time.Now().In(loc)
    var start, end time.Time

    switch scope {
    case "day":
        start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
        end = start.AddDate(0, 0, 1)
    case "week":
        weekday := int(now.Weekday())
        if weekday == 0 {
            weekday = 7
        }
        start = time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, loc) // จันทร์นี้
        end = start.AddDate(0, 0, 7) // อาทิตย์นี้
    default: // month
        year := now.Year()
        month := now.Month()
        if y := c.Query("year"); y != "" {
            if yy, err := strconv.Atoi(y); err == nil {
                year = yy
            }
        }
        if m := c.Query("month"); m != "" {
            if mm, err := strconv.Atoi(m); err == nil && mm >= 1 && mm <= 12 {
                month = time.Month(mm)
            }
        }
        start = time.Date(year, month, 1, 0, 0, 0, 0, loc)
        end = start.AddDate(0, 1, 0)
    }

    // convert เป็น UTC ถ้า DB เก็บ UTC
    startUTC := start.UTC()
    endUTC := end.UTC()

    var count int64
    err = db.Model(&entity.Diaries{}).
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Where("diaries.updated_at >= ? AND diaries.updated_at < ?", startUTC, endUTC).
        Count(&count).Error

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "count": count,
        "scope": scope,
        "start": startUTC,
        "end":   endUTC,
    })
}

// GET /api/patients/:patientId/diaries/home?tz=Asia/Bangkok
func GetHomeDiariesByPatient(c *gin.Context) {
    db := config.DB()

    // --- patient id ---
    pidStr := c.Param("patientId")
    pid, err := strconv.ParseUint(pidStr, 10, 64)
    if err != nil || pid == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
        return
    }

    // --- timezone ---
    tz := c.DefaultQuery("tz", "Asia/Bangkok")
    loc, err := time.LoadLocation(tz)
    if err != nil {
        loc = time.FixedZone("Asia/Bangkok", 7*3600)
    }

    now := time.Now().In(loc)

    // ===== ช่วง "วันนี้" (ตามโซน) =====
    startTodayLocal := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc)
    endTodayLocal := startTodayLocal.AddDate(0, 0, 1)
    startTodayUTC := startTodayLocal.UTC()
    endTodayUTC := endTodayLocal.UTC()

    // ===== ช่วง "สัปดาห์ที่ผ่านมา" =====
    weekday := int(now.Weekday())
    if weekday == 0 { weekday = 7 } // Sunday->7
    startThisWeekLocal := time.Date(now.Year(), now.Month(), now.Day()-weekday+1, 0, 0, 0, 0, loc)
    startPrevWeekLocal := startThisWeekLocal.AddDate(0, 0, -7)
    endPrevWeekLocal := startThisWeekLocal

    startPrevWeekUTC := startPrevWeekLocal.UTC()
    endPrevWeekUTC := endPrevWeekLocal.UTC()

    var todayDiary entity.Diaries
    var weekDiary entity.Diaries
    var todayList []entity.Diaries
    var weekList []entity.Diaries

    // ล่าสุดของวันนี้
    _ = db.
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Where("diaries.updated_at >= ? AND diaries.updated_at < ?", startTodayUTC, endTodayUTC).
        Order("diaries.updated_at DESC").
        First(&todayDiary).Error

    // ทั้งหมดของวันนี้
    _ = db.
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Where("diaries.updated_at >= ? AND diaries.updated_at < ?", startTodayUTC, endTodayUTC).
        Order("diaries.updated_at DESC").
        Find(&todayList).Error

    // ล่าสุดของสัปดาห์ที่ผ่านมา
    _ = db.
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Where("diaries.updated_at >= ? AND diaries.updated_at < ?", startPrevWeekUTC, endPrevWeekUTC).
        Order("diaries.updated_at DESC").
        First(&weekDiary).Error

    // ทั้งหมดของสัปดาห์ที่ผ่านมา
    _ = db.
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Where("diaries.updated_at >= ? AND diaries.updated_at < ?", startPrevWeekUTC, endPrevWeekUTC).
        Order("diaries.updated_at DESC").
        Find(&weekList).Error

    c.JSON(http.StatusOK, gin.H{
        "today":      nullIfZeroDiary(todayDiary), // ถ้าไม่มี -> null
        "week":       nullIfZeroDiary(weekDiary),
        "today_list": todayList,
        "week_list":  weekList,
    })
}
func ListDiariesForPatient(c *gin.Context) {
    db := config.DB()

    pidStr := c.Param("patientId")
    pid, err := strconv.ParseUint(pidStr, 10, 64)
    if err != nil || pid == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
        return
    }

    fromStr := c.Query("from")
    toStr   := c.Query("to")

    q := db.Model(&entity.Diaries{}).
        Preload("TherapyCase"). // ✅ สำคัญ
        Select("diaries.*").
        Joins("JOIN therapy_cases ON therapy_cases.id = diaries.therapy_case_id").
        Where("therapy_cases.patient_id = ?", pid).
        Order("diaries.updated_at DESC")

    if fromStr != "" {
        if t, err := time.Parse(time.RFC3339, fromStr); err == nil {
            q = q.Where("diaries.updated_at >= ?", t.UTC())
        }
    }
    if toStr != "" {
        if t, err := time.Parse(time.RFC3339, toStr); err == nil {
            q = q.Where("diaries.updated_at < ?", t.UTC())
        }
    }

    var out []entity.Diaries
    if err := q.Find(&out).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, out)
}
