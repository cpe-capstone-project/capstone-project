package therapy_case

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"time"
)

type CreateTherapyCaseInput struct {
    CaseTitle       string `json:"case_title" binding:"required"`
    CaseDescription string `json:"case_description" binding:"required"`
    CaseStartDate   string `json:"case_start_date" binding:"required"`
    CaseStatusID    uint   `json:"case_status_id" binding:"required"`
    PsychologistID  uint   `json:"psychologist_id" binding:"required"`
    PatientID       uint   `json:"patient_id" binding:"required"`
}

func GetCaseStatuses(c *gin.Context) {
	var statuses []entity.CaseStatus

	if err := config.DB().Find(&statuses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, statuses)
}

// GET /therapy-case/patient/:id
func GetTherapyCaseByPatientID(c *gin.Context) {
	patientID := c.Param("id")
	var therapyCase entity.TherapyCase

	db := config.DB()
	result := db.Preload("CaseStatus").
		Preload("Psychologist").
		Preload("Patient").
		Where("patient_id = ?", patientID).
		Order("created_at desc").
		First(&therapyCase) // ดึงตัวแรก (ล่าสุด)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "No therapy case found for this patient"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// ไม่มีข้อมูลแล้ว return 404
	c.JSON(http.StatusOK, therapyCase)
}

func GetTherapyCasesByPsychologistID(c *gin.Context) {
    psychoID := c.Param("id") // รับ Psychologist ID จาก URL

    var therapyCases []entity.TherapyCase

    db := config.DB()
    // ดึงทุก TherapyCase ของ Psychologist พร้อม preload Patient และ CaseStatus
    result := db.Preload("Patient").Preload("CaseStatus").Where("psychologist_id = ?", psychoID).Find(&therapyCases)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
        return
    }

    if len(therapyCases) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }

    c.JSON(http.StatusOK, therapyCases)
}

func GetTherapyCasesByID(c *gin.Context) {
    id := c.Param("id") // รับ Psychologist ID จาก URL

    var therapyCases []entity.TherapyCase

    db := config.DB()
    // ดึงทุก TherapyCase ของ Psychologist พร้อม preload Patient และ CaseStatus
    result := db.Preload("Patient").Preload("CaseStatus").Where("id = ?", id).Find(&therapyCases)
    if result.Error != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
        return
    }

    if len(therapyCases) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }

    c.JSON(http.StatusOK, therapyCases)
}

func GetPatientByPsychologistID(c *gin.Context) {
    psychoID := c.Param("id") // รับ Psychologist ID จาก URL

    var patients []entity.Patients

    db := config.DB()

    // Subquery: เลือก patient_id ที่มีอยู่ใน therapy_case
    subQuery := db.Model(&entity.TherapyCase{}).Select("patient_id")

    // ดึง Patients ของ psychologist_id ที่ยังไม่มีใน therapy_case
    result := db.Where("psychologist_id = ?", psychoID).
        Where("id NOT IN (?)", subQuery).
        Find(&patients)

    if result.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
        return
    }

    if len(patients) == 0 {
        c.JSON(http.StatusNoContent, gin.H{})
        return
    }

    c.JSON(http.StatusOK, patients)
}

func CreateTherapyCase(c *gin.Context) {
    var input CreateTherapyCaseInput

    // Bind JSON
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // แปลง string เป็น time.Time
    caseStartDate, err := time.Parse("2006-01-02", input.CaseStartDate)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "วันที่เริ่มไม่ถูกต้อง"})
        return
    }

    therapyCase := entity.TherapyCase{
        CaseTitle:       input.CaseTitle,
        CaseDescription: input.CaseDescription,
        CaseStartDate:   caseStartDate,
        CaseStatusID:    input.CaseStatusID,
        PsychologistID:  input.PsychologistID,
        PatientID:       input.PatientID,
    }

	db := config.DB()

    if err := db.Create(&therapyCase).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"data": therapyCase})
}

func UpdateTherapyCase(c *gin.Context) {
    db := config.DB()

    // ดึง id จากพารามิเตอร์
    id := c.Param("id")

    // หา record เดิมก่อน
    var therapyCase entity.TherapyCase
    if err := db.First(&therapyCase, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเคสนี้"})
        return
    }

    // bind ข้อมูลใหม่
    var input CreateTherapyCaseInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง: " + err.Error()})
        return
    }

    // แปลงวันที่
    caseStartDate, err := time.Parse("2006-01-02", input.CaseStartDate)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"})
        return
    }

    // อัปเดตค่า
    therapyCase.CaseTitle = input.CaseTitle
    therapyCase.CaseDescription = input.CaseDescription
    therapyCase.CaseStartDate = caseStartDate
    therapyCase.CaseStatusID = input.CaseStatusID
    therapyCase.PsychologistID = input.PsychologistID
    therapyCase.PatientID = input.PatientID

    // บันทึก
    if err := db.Save(&therapyCase).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตข้อมูลได้: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "แก้ไขเคสสำเร็จ", "data": therapyCase})
}

func DeleteTherapyCase(c *gin.Context) {
    db := config.DB()

    // ดึง id จากพารามิเตอร์
    id := c.Param("id")

    // หา record ก่อน
    var therapyCase entity.TherapyCase
    if err := db.First(&therapyCase, id).Error; err != nil {
        if err == gorm.ErrRecordNotFound {
            c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเคสนี้"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // ลบ record
    if err := db.Delete(&therapyCase).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบเคสได้: " + err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "ลบเคสสำเร็จ"})
}

func GetDiariesByTherapyCaseID(c *gin.Context) {
	therapyCaseID := c.Param("id")

	var diaries []entity.Diaries
	if err := config.DB().Preload("EmotionAnalysisResults").Where("therapy_case_id = ?", therapyCaseID).Find(&diaries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล Diaries ได้"})
		return
	}

	// ===== เช็คว่ามีการเขียนวันนี้หรือยัง =====
	today := time.Now().Format("2006-01-02") // YYYY-MM-DD
	var todayDiary entity.Diaries

	err := config.DB().Where("therapy_case_id = ? AND DATE(created_at) = ?", therapyCaseID, today).First(&todayDiary).Error
	writtenToday := err == nil // true ถ้ามี record วันนี้

	c.JSON(http.StatusOK, gin.H{
		"diaries":       diaries,
		"written_today": writtenToday,
	})
}

func GetThoughtRecordsByTherapyCaseID(c *gin.Context) {
    therapyCaseID := c.Param("id")

    var records []entity.ThoughtRecord
    if err := config.DB().Where("therapy_case_id = ?", therapyCaseID).Find(&records).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูล ThoughtRecord ได้"})
        return
    }

    // ===== เช็คว่ามีการเขียนวันนี้หรือยัง =====
    today := time.Now().Format("2006-01-02") // YYYY-MM-DD
    var todayRecord entity.ThoughtRecord

    err := config.DB().Where("therapy_case_id = ? AND DATE(created_at) = ?", therapyCaseID, today).First(&todayRecord).Error
    writtenToday := err == nil // true ถ้ามี record วันนี้

    c.JSON(http.StatusOK, gin.H{
        "thought_records": records,
        "written_today":   writtenToday,
    })
}




