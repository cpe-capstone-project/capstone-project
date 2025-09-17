package emotion

import (
	"net/http"
    // "time"
	"strconv"
	"gorm.io/gorm"
	"github.com/gin-gonic/gin"
	"capstone-project/config"
	"capstone-project/entity"
)

type PatientWithEmotionStats struct {
	PatientInfo           PatientBasicInfo    `json:"patient_info"`
	PrimaryEmotionStats   PrimaryEmotionStats `json:"primary_emotion_stats"`
	LatestPrimaryEmotion  string              `json:"latest_primary_emotion"`
}
type PatientsListDashboardResponse struct {
	Patients []PatientWithEmotionStats `json:"patients"`
	Total    int                       `json:"total"`
}


//
// Struct สำหรับข้อมูลผู้ป่วยพื้นฐาน
type PatientBasicInfo struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Age       uint8  `json:"age"`
	GenderID  uint   `json:"gender_id"`
}
type DashboardDetailsResponseWithStats struct {
	EmotionDetails      []DashboardDetailsResponse `json:"emotion_details"`
	PrimaryEmotionStats PrimaryEmotionStats        `json:"primary_emotion_stats"`
}


type PrimaryEmotionStats struct {
	PositiveEmotions int `json:"positive_emotions"`
	NegativeEmotions int `json:"negative_emotions"`
	TotalRecords     int `json:"total_records"`
}

type PatientDashboardResponseById struct {
	PatientInfo         PatientBasicInfo     `json:"patient_info"`
	PrimaryEmotionStats PrimaryEmotionStats  `json:"primary_emotion_stats"`
}

// GET /patientslist/dashboard_by_psychologist_id/:id - Get patients by psychologist ID with emotion stats
func GetPatientsListDashboard(c *gin.Context) {
	// Get psychologist ID from path parameter
	psychologistIDStr := c.Param("id")
	if psychologistIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Psychologist ID is required in URL path",
		})
		return
	}

	psychologistID, err := strconv.ParseUint(psychologistIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid psychologist ID format",
		})
		return
	}

	db := config.DB()

	// Get patients under specific psychologist with basic information
	var patients []entity.Patients
	result := db.Select("id, first_name, last_name, age, gender_id, psychologist_id").
		Where("psychologist_id = ?", psychologistID).
		Find(&patients)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get patients: " + result.Error.Error(),
		})
		return
	}

	// Check if psychologist has any patients
	if len(patients) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No patients found for this psychologist",
		})
		return
	}

	// Create response array
	var patientsWithStats []PatientWithEmotionStats

	// Process each patient
	for _, patient := range patients {
		// Create patient basic info
		patientInfo := PatientBasicInfo{
			ID:        patient.ID,
			FirstName: patient.FirstName,
			LastName:  patient.LastName,
			Age:       patient.Age,
			GenderID:  patient.GenderID,
		}

		// Get Primary Emotion Statistics for last 7 records for this patient
		primaryEmotionStats, err := getPrimaryEmotionStatsForPatient(db, patient.ID)
		if err != nil {
			// Log error but continue with empty stats instead of failing completely
			primaryEmotionStats = PrimaryEmotionStats{
				PositiveEmotions: 0,
				NegativeEmotions: 0,
				TotalRecords:     0,
			}
		}

		// Get Latest Primary Emotion for this patient
		latestPrimaryEmotion, err := getLatestPrimaryEmotionForPatient(db, patient.ID)
		if err != nil {
			// Log error but continue with empty emotion instead of failing completely
			latestPrimaryEmotion = ""
		}

		// Combine patient info with emotion stats
		patientWithStats := PatientWithEmotionStats{
			PatientInfo:          patientInfo,
			PrimaryEmotionStats:  primaryEmotionStats,
			LatestPrimaryEmotion: latestPrimaryEmotion,
		}

		patientsWithStats = append(patientsWithStats, patientWithStats)
	}

	// Create final response
	response := PatientsListDashboardResponse{
		Patients: patientsWithStats,
		Total:    len(patientsWithStats),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Patients list for psychologist with emotion stats retrieved successfully",
		"data":    response,
		"psychologist_id": psychologistID,
	})
}

// Helper function to get latest primary emotion for a specific patient (simplified)
func getLatestPrimaryEmotionForPatient(db *gorm.DB, patientID uint) (string, error) {
	var analysisResult entity.EmotionAnalysisResults

	// Get the most recent emotion analysis result for this patient
	err := db.Where("patient_id = ?", patientID).
		Order("analysis_timestamp DESC").
		First(&analysisResult).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// No analysis found - return empty string
			return "", nil
		}
		return "", err
	}

	// Return the primary emotion (could be empty string if not analyzed)
	return analysisResult.PrimaryEmotion, nil
}

// Helper function to get primary emotion statistics for a specific patient
func getPrimaryEmotionStatsForPatient(db *gorm.DB, patientID uint) (PrimaryEmotionStats, error) {
	var stats PrimaryEmotionStats
	var analysisResults []entity.EmotionAnalysisResults

	// Get the last 7 emotion analysis results for this patient
	err := db.Where("patient_id = ?", patientID).
		Order("analysis_timestamp DESC").
		Limit(7).
		Find(&analysisResults).Error

	if err != nil {
		return stats, err
	}

	stats.TotalRecords = len(analysisResults)

	// If no records found, return empty stats
	if stats.TotalRecords == 0 {
		return stats, nil
	}

	// Get all primary emotions from these results
	var primaryEmotions []string
	for _, result := range analysisResults {
		if result.PrimaryEmotion != "" {
			primaryEmotions = append(primaryEmotions, result.PrimaryEmotion)
		}
	}

	// If no primary emotions found, return current stats
	if len(primaryEmotions) == 0 {
		return stats, nil
	}

	// Query emotions table to get categories for these primary emotions
	var emotions []entity.Emotions
	err = db.Where("emotionsname IN ?", primaryEmotions).Find(&emotions).Error
	if err != nil {
		return stats, err
	}

	// Create a map for quick lookup
	emotionCategoryMap := make(map[string]string)
	for _, emotion := range emotions {
		emotionCategoryMap[emotion.Emotionsname] = emotion.Category
	}

	// Count positive and negative emotions
	for _, result := range analysisResults {
		if result.PrimaryEmotion != "" {
			category, exists := emotionCategoryMap[result.PrimaryEmotion]
			if exists {
				switch category {
				case "PositiveEmotions":
					stats.PositiveEmotions++
				case "NegativeEmotions":
					stats.NegativeEmotions++
				}
			}
		}
	}

	return stats, nil
}

// GET /patientslist/dashboard/:id - Get specific patient basic info by ID with emotion stats
func GetPatientsDashboardByID(c *gin.Context) {
	// Get patient ID from path parameter
	patientIDStr := c.Param("id")
	patientID, err := strconv.ParseUint(patientIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid patient ID format",
		})
		return
	}

	db := config.DB()

	// Get specific patient with basic information
	var patient entity.Patients
	result := db.Select("id, first_name, last_name, age").
		First(&patient, patientID)

	if result.Error != nil {
		if result.Error.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Patient not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get patient: " + result.Error.Error(),
		})
		return
	}

	// Create patient basic info
	patientInfo := PatientBasicInfo{
		ID:        patient.ID,
		FirstName: patient.FirstName,
		LastName:  patient.LastName,
		// Email:     patient.Email,
		Age:       patient.Age,
	}

	// Get Primary Emotion Statistics for last 7 records
	primaryEmotionStats, err := getPrimaryEmotionStatsForPatient(db, uint(patientID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get primary emotion statistics: " + err.Error(),
		})
		return
	}

	// Combine response
	response := PatientDashboardResponseById{
		PatientInfo:         patientInfo,
		PrimaryEmotionStats: primaryEmotionStats,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Patient information with emotion stats retrieved successfully",
		"data":    response,
	})
}

