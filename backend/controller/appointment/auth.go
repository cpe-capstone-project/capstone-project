package appointment

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ========== สร้างนัดหมายใหม่ ==========
func CreateAppointment(c *gin.Context) {
	var req struct {
		Title          string    `json:"title"`
		Detail         string    `json:"detail"`
		Start          time.Time `json:"start"`
		End            time.Time `json:"end"`
		PsychologistID uint      `json:"psychologist_id"`
		PatientID      uint      `json:"patient_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()

	appointment := entity.Appointment{
		Title:          req.Title,
		Detail:         req.Detail,
		StartTime:      req.Start,
		EndTime:        req.End,
		PsychologistID: req.PsychologistID,
		PatientID:      req.PatientID,
		Status:         "pending",
	}

	if err := db.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": appointment.ID})
}

// ========== ดึงนัดหมายทั้งหมดของนักจิต ==========
func GetAppointmentsByPsychologist(c *gin.Context) {
	id := c.Query("psychologist_id")
	db := config.DB()

	var appointments []entity.Appointment
	if err := db.Preload("Patient").Where("psychologist_id = ?", id).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve appointments"})
		return
	}

	c.JSON(http.StatusOK, appointments)
}

// ========== ดึงนัดหมายของผู้ป่วย ==========
func GetAppointmentsByPatient(c *gin.Context) {
	id := c.Query("patient_id")
	db := config.DB()

	var appointments []entity.Appointment
	if err := db.Preload("Psychologist").Where("patient_id = ?", id).Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve appointments"})
		return
	}

	c.JSON(http.StatusOK, appointments)
}

// ========== อัปเดตสถานะนัดหมาย (เช่น ยอมรับ/ปฏิเสธ) ==========
func UpdateAppointmentStatus(c *gin.Context) {
	var req struct {
		ID     uint   `json:"id"`
		Status string `json:"status"` // accepted / rejected
		Reason string `json:"reason"` // optional
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()
	var appointment entity.Appointment
	if err := db.First(&appointment, req.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	appointment.Status = req.Status
	appointment.Reason = req.Reason

	if err := db.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

// ========== ลบนัดหมาย ==========
func DeleteAppointment(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid appointment ID"})
		return
	}

	db := config.DB()
	if err := db.Delete(&entity.Appointment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted"})
}
// ========== อัปเดตเวลาเริ่ม-สิ้นสุดนัดหมาย ==========
func UpdateAppointmentTime(c *gin.Context) {
	var req struct {
		ID       uint      `json:"id"`        // ✅ ใช้ ID แทน Title
		NewStart time.Time `json:"new_start"`
		NewEnd   time.Time `json:"new_end"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	db := config.DB()
	var appointment entity.Appointment

	// ✅ แก้จาก title เป็น ID
	if err := db.First(&appointment, req.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	appointment.StartTime = req.NewStart
	appointment.EndTime = req.NewEnd

	if err := db.Save(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment time"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Appointment time updated"})
}