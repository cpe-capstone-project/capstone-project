// appointment/controller.go
package appointment

import (
    "capstone-project/config"
    "capstone-project/controller/ws"
    "capstone-project/entity"
    "fmt"
    "log"
    "net/http"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
)

const (
    doctorPrefix  = "d:"
    patientPrefix = "p:"
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

    // ✅ ส่งไปยัง "ผู้ป่วย" ด้วยคีย์ p:{patient_id} ให้ตรงกับ ws_uid
    log.Println("📤 WS -> patient:", appointment.PatientID)
    ws.GlobalHub.SendToUser(patientPrefix+fmt.Sprint(appointment.PatientID), map[string]interface{}{
        "type":           "appointment_created",
        "title":          appointment.Title,
        "detail":         appointment.Detail,
        "start_time":     appointment.StartTime.Format(time.RFC3339),
        "end_time":       appointment.EndTime.Format(time.RFC3339),
        "appointment_id": appointment.ID,
        "status":         appointment.Status,
    })

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
func UpdateAppointmentStatus(c *gin.Context) {
    var req struct {
        ID     uint   `json:"id"`
        Status string `json:"status"` // accepted / rejected
        Reason string `json:"reason"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    s := strings.ToLower(strings.TrimSpace(req.Status))
    if s != "accepted" && s != "rejected" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "invalid status"})
        return
    }

    db := config.DB()

    // เช็คว่ามีจริงไหม
    var ap entity.Appointment
    if err := db.First(&ap, req.ID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
        return
    }

    // อัปเดตแบบเช็คผล
    tx := db.Model(&entity.Appointment{}).
        Where("id = ?", req.ID).
        Updates(map[string]interface{}{"status": s, "reason": req.Reason})
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
        return
    }
    if tx.RowsAffected == 0 {
        c.JSON(http.StatusConflict, gin.H{"error": "No rows updated"})
        return
    }

    // โหลดค่าใหม่อีกรอบเพื่อส่งกลับ
    if err := db.First(&ap, req.ID).Error; err == nil {
        // แจ้ง WS ทั้งสองฝั่ง
        ws.GlobalHub.SendToUser(doctorPrefix+fmt.Sprint(ap.PsychologistID), map[string]interface{}{
            "type":           "appointment_status_changed",
            "appointment_id": ap.ID,
            "status":         ap.Status,
        })
        ws.GlobalHub.SendToUser(patientPrefix+fmt.Sprint(ap.PatientID), map[string]interface{}{
            "type":           "appointment_status_echo",
            "appointment_id": ap.ID,
            "status":         ap.Status,
        })
        c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully", "appointment": ap})
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

// ========== อัปเดตเวลาเริ่ม-สิ้นสุด ==========
func UpdateAppointmentTime(c *gin.Context) {
    var req struct {
        ID       uint      `json:"id"`
        NewStart time.Time `json:"new_start"`
        NewEnd   time.Time `json:"new_end"`
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

    appointment.StartTime = req.NewStart
    appointment.EndTime = req.NewEnd
    if err := db.Save(&appointment).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update appointment time"})
        return
    }

    // ✅ แจ้งทั้งสองฝั่งให้ sync ปฏิทิน/การ์ด
    payload := map[string]interface{}{
        "type":           "appointment_time_updated",
        "appointment_id": appointment.ID,
        "new_start":      appointment.StartTime.Format(time.RFC3339),
        "new_end":        appointment.EndTime.Format(time.RFC3339),
    }
    ws.GlobalHub.SendToUser(doctorPrefix+fmt.Sprint(appointment.PsychologistID), payload)
    ws.GlobalHub.SendToUser(patientPrefix+fmt.Sprint(appointment.PatientID), payload)

    c.JSON(http.StatusOK, gin.H{"message": "Appointment time updated"})
}
