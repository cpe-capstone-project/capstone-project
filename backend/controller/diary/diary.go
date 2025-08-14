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
func ListDiaries(c *gin.Context){
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

	results := db.Preload("TherapyCase").Preload("Feedbacks.Psychologist").Preload("Feedbacks.FeedbackType").Find(&diaries)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diaries)
}

// GET /diary/:id
func GetDiaryByID(c *gin.Context){
	ID := c.Param("id")
	var diary entity.Diaries

	db := config.DB()
	results := db.Preload("TherapyCase").Preload("Feedbacks").First(&diary, ID)
	if results.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if diary.ID == 0{
		c.JSON(http.StatusNoContent, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, diary)
}

// POST /diary
func CreateDiary(c *gin.Context){
	var diary entity.Diaries

	//bind เข้าตัวแปร diary
	if err := c.ShouldBindJSON(&diary); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	defaultColors := "#FFC107,#FF9800,#FF5722"
	if diary.TagColors == "" {
		diary.TagColors = defaultColors
	}

	db := config.DB()

	bc := entity.Diaries{
		Title: diary.Title,
		Content: diary.Content,
		TagColors: diary.TagColors,
		Confirmed: false,
		TherapyCaseID: diary.TherapyCaseID,
	}

	//บันทึก
	if err := db.Create(&bc).Error; err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, bc)
}

// PATCH /diary/:id
func UpdateDiaryByID(c *gin.Context){
	var diary entity.Diaries
	diaryID := c.Param("id")
	db := config.DB()
	
	result := db.First(&diary, diaryID)
	if result.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": "id not found"})
		return
	}

	if err := c.ShouldBindJSON(&diary); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	defaultColors := "#FFC107,#FF9800,#FF5722"
	if diary.TagColors == "" {
		diary.TagColors = defaultColors
	}

	if diary.Confirmed == false {
		diary.Confirmed = true
	}

	result = db.Save(&diary)
	if result.Error != nil{
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
