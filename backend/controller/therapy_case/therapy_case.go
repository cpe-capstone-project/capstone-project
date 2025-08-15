package therapy_case

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /therapy-case/patient/:id
func GetTherapyCaseByPatientID(c *gin.Context) {
	patientID := c.Param("id")
	var therapyCase entity.TherapyCase

	db := config.DB()
	result := db.Preload("CaseStatus").
		Preload("Psychologist").
		Preload("Patients").
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
