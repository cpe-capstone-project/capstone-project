package emotion

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Response structure for dashboard details
type DashboardDetailsResponse struct {
	EmotionsName         string  `json:"emotions_name"`
	ConfidencePercentage float64 `json:"confidence_percentage"`
}

// GET /emotion/detailsdashboard_1/:id/:mode/:date
func GetDashboardDetails_1ByID(c *gin.Context) {
	patientID := c.Param("id")
	mode := c.Param("mode")
	dateParam := c.Param("date")

	// Parse date parameter (expecting format: YYYY-MM-DD)
	targetDate, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	// Validate mode parameter
	if mode != "1" && mode != "2" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mode must be 1 or 2"})
		return
	}

	db := config.DB()
	var subEmotions []entity.SubEmotionAnalysis

	// Build query based on mode
	query := db.Joins("JOIN emotion_analysis_results ON sub_emotion_analyses.emotion_analysis_results_id = emotion_analysis_results.id").
		Joins("JOIN emotions ON sub_emotion_analyses.emotions_id = emotions.id").
		Where("emotion_analysis_results.patient_id = ?", patientID).
		Where("DATE(emotion_analysis_results.analysis_timestamp) = ?", targetDate.Format("2006-01-02"))

	// Add condition based on mode
	if mode == "1" {
		// Mode 1: Only records with DiaryID (not null or 0)
		query = query.Where("emotion_analysis_results.diary_id IS NOT NULL AND emotion_analysis_results.diary_id != 0")
	} else if mode == "2" {
		// Mode 2: Only records with ThoughtRecordID (not null or 0)
		query = query.Where("emotion_analysis_results.thought_record_id IS NOT NULL AND emotion_analysis_results.thought_record_id != 0")
	}

	// Preload the necessary relationships and execute query
	results := query.Preload("EmotionAnalysisResults").Preload("Emotions").Find(&subEmotions)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	// Check if any records found
	if len(subEmotions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis data found for the specified criteria"})
		return
	}

	// Transform data to response format
	var response []DashboardDetailsResponse
	for _, subEmotion := range subEmotions {
		if subEmotion.Emotions != nil {
			response = append(response, DashboardDetailsResponse{
				EmotionsName:         subEmotion.Emotions.Emotionsname,
				ConfidencePercentage: subEmotion.ConfidencePercentage,
			})
		}
	}

	c.JSON(http.StatusOK, response)
}

type EmotionProportionResponse struct {
	EmotionsName string  `json:"emotions_name"`
	Proportion   float64 `json:"proportion"`
	Category string  `json:"emotions_category"`
}

// GET /emotion/detailsdashboard_2/:id/:stardate/:enddate
func GetEmotionDetailsDashBoardByIDAndTime_2(c *gin.Context) {
	patientID := c.Param("id")
	startDateParam := c.Param("stardate")
	endDateParam := c.Param("enddate")

	// Parse date parameters (expecting format: YYYY-MM-DD)
	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format. Use YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format. Use YYYY-MM-DD"})
		return
	}

	// Validate date range
	if startDate.After(endDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date cannot be after end date"})
		return
	}

	db := config.DB()
	var subEmotions []entity.SubEmotionAnalysis

	// Query to get all SubEmotionAnalysis records for the patient in the date range
	results := db.Joins("JOIN emotion_analysis_results ON sub_emotion_analyses.emotion_analysis_results_id = emotion_analysis_results.id").
		Where("emotion_analysis_results.patient_id = ?", patientID).
		Where("DATE(emotion_analysis_results.analysis_timestamp) >= ? AND DATE(emotion_analysis_results.analysis_timestamp) <= ?", 
			startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Preload("Emotions").
		Preload("EmotionAnalysisResults").
		Find(&subEmotions)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	// Check if any records found
	if len(subEmotions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis data found for the specified date range"})
		return
	}

	// Create a map to sum confidence percentages by emotion
	emotionSums := make(map[uint]float64)
	emotionNames := make(map[uint]string)
	emotionCategories := make(map[uint]string)
	var totalSum float64

	// Calculate sum for each emotion and total sum
	for _, subEmotion := range subEmotions {
		if subEmotion.Emotions != nil {
			emotionSums[subEmotion.EmotionsID] += subEmotion.ConfidencePercentage
			emotionNames[subEmotion.EmotionsID] = subEmotion.Emotions.Emotionsname
			emotionCategories[subEmotion.EmotionsID] = subEmotion.Emotions.Category  // <-- เพิ่มบรรทัดนี้
			totalSum += subEmotion.ConfidencePercentage
		}
	}

	// Check if totalSum is zero to avoid division by zero
	if totalSum == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Total confidence percentage is zero, cannot calculate proportions"})
		return
	}

	// Calculate proportions and prepare response
	var response []EmotionProportionResponse
	for emotionID, sum := range emotionSums {
		proportion := sum / totalSum
		response = append(response, EmotionProportionResponse{
			EmotionsName: emotionNames[emotionID],
			Category:     emotionCategories[emotionID],
			Proportion:   proportion,
		})
	}

	// Sort response by proportion in descending order (optional)
	// You can uncomment the following code if you want to sort the results
	/*
	sort.Slice(response, func(i, j int) bool {
		return response[i].Proportion > response[j].Proportion
	})
	*/

	c.JSON(http.StatusOK, response)
}

// Response structure for primary emotion details
type PrimaryEmotionDetail struct {
	EmotionName string  `json:"emotion_name"`
	Count       int     `json:"count"`
	Percentage  float64 `json:"percentage"`
}

// Response structure for category summary
type CategorySummary struct {
	Category   string  `json:"category"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

// Main response structure
type PrimaryEmotionDashboardResponse struct {
	TotalRecords       int                    `json:"total_records"`
	EmotionDetails     []PrimaryEmotionDetail `json:"emotion_details"`
	CategorySummary    []CategorySummary      `json:"category_summary"`
}

// GET /emotion/detailsdashboard_3/:id/:stardate/:enddate
func GetEmotionDetailsPrimaryEmoDashBoardByIDandTime(c *gin.Context) {
	patientID := c.Param("id")
	startDateParam := c.Param("stardate")
	endDateParam := c.Param("enddate")

	// Parse date parameters (expecting format: YYYY-MM-DD)
	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format. Use YYYY-MM-DD"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format. Use YYYY-MM-DD"})
		return
	}

	// Validate date range
	if startDate.After(endDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Start date cannot be after end date"})
		return
	}

	db := config.DB()
	var emotionResults []entity.EmotionAnalysisResults

	// Query to get all EmotionAnalysisResults for the patient in the date range
	results := db.Where("patient_id = ?", patientID).
		Where("DATE(analysis_timestamp) >= ? AND DATE(analysis_timestamp) <= ?", 
			startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Find(&emotionResults)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	// Check if any records found
	if len(emotionResults) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No emotion analysis data found for the specified date range"})
		return
	}

	// Count primary emotions
	emotionCount := make(map[string]int)
	totalRecords := len(emotionResults)

	for _, result := range emotionResults {
		if result.PrimaryEmotion != "" {
			emotionCount[result.PrimaryEmotion]++
		}
	}

	// Get emotion details from Emotions table to get categories
	var emotions []entity.Emotions
	db.Find(&emotions)

	// Create maps for quick lookup
	emotionCategories := make(map[string]string)
	for _, emotion := range emotions {
		emotionCategories[emotion.Emotionsname] = emotion.Category
	}

	// Prepare emotion details response
	var emotionDetails []PrimaryEmotionDetail
	categoryCount := make(map[string]int)

	for emotionName, count := range emotionCount {
		percentage := (float64(count) / float64(totalRecords)) * 100
		
		emotionDetails = append(emotionDetails, PrimaryEmotionDetail{
			EmotionName: emotionName,
			Count:       count,
			Percentage:  percentage,
		})

		// Count by category
		if category, exists := emotionCategories[emotionName]; exists {
			categoryCount[category] += count
		} else {
			// If emotion not found in Emotions table, categorize as "Unknown"
			categoryCount["Unknown"] += count
		}
	}

	// Prepare category summary
	var categorySummary []CategorySummary
	for category, count := range categoryCount {
		percentage := (float64(count) / float64(totalRecords)) * 100
		categorySummary = append(categorySummary, CategorySummary{
			Category:   category,
			Count:      count,
			Percentage: percentage,
		})
	}

	// Sort results (optional - you can uncomment if needed)
	/*
	// Sort emotion details by count (descending)
	sort.Slice(emotionDetails, func(i, j int) bool {
		return emotionDetails[i].Count > emotionDetails[j].Count
	})

	// Sort category summary by count (descending)
	sort.Slice(categorySummary, func(i, j int) bool {
		return categorySummary[i].Count > categorySummary[j].Count
	})
	*/

	response := PrimaryEmotionDashboardResponse{
		TotalRecords:    totalRecords,
		EmotionDetails:  emotionDetails,
		CategorySummary: categorySummary,
	}

	c.JSON(http.StatusOK, response)
}

// GET /emotion/detailsdashboard_4/:id/:stardate/:enddate
func GetEmotionDetailsSubWeekDashBoardByIDandTime(c *gin.Context) {
	patientID := c.Param("id")
	startDate := c.Param("stardate")
	endDate := c.Param("enddate")

	db := config.DB()

	// Parse dates
	startDateTime, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start date format. Use YYYY-MM-DD"})
		return
	}

	endDateTime, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end date format. Use YYYY-MM-DD"})
		return
	}

	// Set end date to end of day (23:59:59)
	endDateTime = endDateTime.Add(23*time.Hour + 59*time.Minute + 59*time.Second)

	// Check if patient exists
	var patient entity.Patients
	if err := db.First(&patient, patientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	var subEmotionAnalyses []entity.SubEmotionAnalysis

	// Query SubEmotionAnalysis with joins and conditions
	results := db.
		Preload("Emotions").
		Preload("EmotionAnalysisResults").
		Joins("JOIN emotion_analysis_results ON sub_emotion_analyses.emotion_analysis_results_id = emotion_analysis_results.id").
		Where("emotion_analysis_results.patient_id = ?", patientID).
		Where("emotion_analysis_results.analysis_timestamp BETWEEN ? AND ?", startDateTime, endDateTime).
		Find(&subEmotionAnalyses)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	// Create response structure
	type SubEmotionDetail struct {
		EmotionName          string  `json:"emotion_name"`
		ConfidencePercentage float64 `json:"confidence_percentage"`
	}

	type EmotionAnalysisGroup struct {
		EmotionAnalysisResultsID uint                `json:"emotion_analysis_results_id"`
		AnalysisTimestamp        time.Time           `json:"analysis_timestamp"`
		SubEmotions              []SubEmotionDetail  `json:"sub_emotions"`
	}

	// Group SubEmotionAnalysis by EmotionAnalysisResultsID
	groupedData := make(map[uint]*EmotionAnalysisGroup)

	for _, subAnalysis := range subEmotionAnalyses {
		resultID := subAnalysis.EmotionAnalysisResultsID
		
		// Create group if not exists
		if _, exists := groupedData[resultID]; !exists {
			groupedData[resultID] = &EmotionAnalysisGroup{
				EmotionAnalysisResultsID: resultID,
				SubEmotions:              []SubEmotionDetail{},
			}
			
			// Add analysis timestamp if available
			if subAnalysis.EmotionAnalysisResults != nil {
				groupedData[resultID].AnalysisTimestamp = subAnalysis.EmotionAnalysisResults.AnalysisTimestamp
			}
		}

		// Add sub emotion detail to the group
		subDetail := SubEmotionDetail{
			ConfidencePercentage: subAnalysis.ConfidencePercentage,
		}

		// Add emotion name if available
		if subAnalysis.Emotions != nil {
			subDetail.EmotionName = subAnalysis.Emotions.Emotionsname
		}

		groupedData[resultID].SubEmotions = append(groupedData[resultID].SubEmotions, subDetail)
	}

	// Convert map to slice
	var emotionGroups []EmotionAnalysisGroup
	for _, group := range groupedData {
		emotionGroups = append(emotionGroups, *group)
	}

	c.JSON(http.StatusOK, emotionGroups)
}