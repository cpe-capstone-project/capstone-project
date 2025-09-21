package emotion

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/translate"
	"github.com/gin-gonic/gin"
	"golang.org/x/text/language"
	"capstone-project/config"
	"capstone-project/entity"
)

// Hugging Face API Configuration
const HUGGING_FACE_API_KEY = "Huggingface API"

// Struct สำหรับ Hugging Face API Request
type HuggingFaceRequest struct {
	Inputs string `json:"inputs"`
}

// Struct สำหรับ Hugging Face API Response
type HuggingFaceResponse [][]struct {
	Label string  `json:"label"`
	Score float64 `json:"score"`
}

// Struct สำหรับผลลัพธ์ที่ประมวลผลแล้ว
type ProcessedEmotionResult struct {
	Text           string         `json:"text"`
	PrimaryEmotion string         `json:"primary_emotion"`
	Confidence     float64        `json:"confidence"`
	SentimentScore int            `json:"sentiment_score"`
	AllEmotions    []EmotionScore `json:"all_emotions"`
	ModelUsed      string         `json:"model_used"`
}

type EmotionScore struct {
	Emotion              string  `json:"emotion"`
	Score                float64 `json:"score"`
	ConfidencePercentage float64 `json:"confidence_percentage"`
	EmotionID            uint    `json:"emotion_id,omitempty"`
}

// POST /emotion-analysis-create-diary/:id - Create emotion analysis from diary (Complete Flow)
func CreateEmotionAnalysisFromDiary(c *gin.Context) {
	// Get diary ID from path parameter
	diaryIDStr := c.Param("id")
	diaryID, err := strconv.ParseUint(diaryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid diary ID format",
		})
		return
	}

	// Step 1: Get diary content and create initial emotion analysis record
	emotionAnalysis, err := createEmotionAnalysisFromDiary(uint(diaryID))
	if err != nil {
		if err.Error() == "diary not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Diary not found"})
			return
		}
		if err.Error() == "diary has no content" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Diary content is empty"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Step 2: Translate text using Google Translate API
	translatedText, err := translateTextToEnglish(emotionAnalysis.InputText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	// Update emotion analysis with translated text
	err = updateEmotionAnalysisTranslation(emotionAnalysis.ID, translatedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation: " + err.Error()})
		return
	}

	// Update the object for response
	emotionAnalysis.TranslatedText = translatedText

	// Step 3: Clean text and analyze emotions using Hugging Face API
	cleanedText := cleanTextForEmotionAnalysis(translatedText)
	emotionResults, err := analyzeEmotionWithHuggingFace(cleanedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Emotion analysis failed: " + err.Error()})
		return
	}

	// Update primary emotion and model version
	err = updatePrimaryEmotionAndModel(emotionAnalysis.ID, emotionResults.PrimaryEmotion, emotionResults.ModelUsed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update primary emotion: " + err.Error()})
		return
	}

	// Step 4: Create SubEmotionAnalysis records
	err = createSubEmotionAnalysisRecords(emotionAnalysis.ID, emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sub-emotion analysis: " + err.Error()})
		return
	}

	// Step 5: Update Patient StatusEmotion based on PrimaryEmotion
	// err = updatePatientStatusEmotion(emotionAnalysis.PatientID, emotionResults.PrimaryEmotion)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient status emotion: " + err.Error()})
	// 	return
	// }

	// Update the object for response
	emotionAnalysis.PrimaryEmotion = emotionResults.PrimaryEmotion
	emotionAnalysis.Modelversion = emotionResults.ModelUsed

	// Get updated patient status for response
	var updatedPatient entity.Patients
	db := config.DB()
	db.First(&updatedPatient, emotionAnalysis.PatientID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Emotion analysis completed successfully",
		"data":    emotionAnalysis,
		"emotion_results": gin.H{
			"primary_emotion": emotionResults.PrimaryEmotion,
			"confidence":      emotionResults.Confidence,
			"model_used":      emotionResults.ModelUsed,
			"sub_emotions_count": len(emotionResults.AllEmotions),
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"patient_status_update": gin.H{
			"patient_id": emotionAnalysis.PatientID,
			// "new_status_emotion": updatedPatient.StatusEmotion,
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"ai_analysis": emotionResults,
		"debug_info": gin.H{
			"original_translated": translatedText,
			"cleaned_for_analysis": cleanedText,
		},
	})
}

// Step 1: Get diary content and create emotion analysis record
func createEmotionAnalysisFromDiary(diaryID uint) (*entity.EmotionAnalysisResults, error) {
	db := config.DB()

	// Get diary from database with TherapyCase relationship to access PatientID
	var diary entity.Diaries
	result := db.Preload("TherapyCase").First(&diary, diaryID)
	if result.Error != nil {
		return nil, fmt.Errorf("diary not found")
	}
	
	if diary.ID == 0 {
		return nil, fmt.Errorf("diary not found")
	}

	if diary.Content == "" {
		return nil, fmt.Errorf("diary has no content")
	}

	// Check if TherapyCase exists and has PatientID
	if diary.TherapyCase == nil {
		return nil, fmt.Errorf("diary is not associated with any therapy case")
	}

	if diary.TherapyCase.PatientID == 0 {
		return nil, fmt.Errorf("therapy case is not associated with any patient")
	}

	// Create emotion analysis record with diary content and PatientID
	emotionAnalysis := entity.EmotionAnalysisResults{
		DiaryID:           diaryID,
		ThoughtRecordID:   0,
		InputText:         diary.Content,
		PatientID:         diary.TherapyCase.PatientID, // เพิ่ม PatientID
		AnalysisTimestamp: time.Now(),
	}

	if err := db.Create(&emotionAnalysis).Error; err != nil {
		return nil, fmt.Errorf("failed to create emotion analysis: %v", err)
	}

	return &emotionAnalysis, nil
}

// Step 2: Translate text to English using Google Translate API
func translateTextToEnglish(text string) (string, error) {
	ctx := context.Background()
	
	client, err := translate.NewClient(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to create translate client: %v", err)
	}
	defer client.Close()

	targetLang, err := language.Parse("en")
	if err != nil {
		return "", fmt.Errorf("failed to parse target language: %v", err)
	}

	resp, err := client.Translate(ctx, []string{text}, targetLang, nil)
	if err != nil {
		return "", fmt.Errorf("translation failed: %v", err)
	}

	if len(resp) == 0 {
		return "", fmt.Errorf("no translation result received")
	}

	return resp[0].Text, nil
}

// Clean text for emotion analysis (remove HTML and decode entities)
func cleanTextForEmotionAnalysis(text string) string {
	// Remove HTML tags
	re := regexp.MustCompile(`<[^>]*>`)
	cleaned := re.ReplaceAllString(text, "")
	
	// Decode HTML entities
	cleaned = html.UnescapeString(cleaned)
	
	// Clean up extra whitespace
	cleaned = strings.TrimSpace(cleaned)
	cleaned = regexp.MustCompile(`\s+`).ReplaceAllString(cleaned, " ")
	
	return cleaned
}

// Update emotion analysis record with translated text
func updateEmotionAnalysisTranslation(emotionAnalysisID uint, translatedText string) error {
	db := config.DB()
	
	result := db.Model(&entity.EmotionAnalysisResults{}).
		Where("id = ?", emotionAnalysisID).
		Update("translated_text", translatedText)
	
	if result.Error != nil {
		return fmt.Errorf("failed to update translated text: %v", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("no emotion analysis record found with ID: %d", emotionAnalysisID)
	}
	
	return nil
}

// Step 3: Analyze emotions using Hugging Face API
func analyzeEmotionWithHuggingFace(text string) (*ProcessedEmotionResult, error) {
	// Hugging Face API endpoint
	url := "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
	
	// สร้าง request body
	requestBody := HuggingFaceRequest{
		Inputs: text,
	}
	
	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}
	
	// สร้าง HTTP request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	
	// ตั้งค่า headers
	req.Header.Set("Authorization", "Bearer "+HUGGING_FACE_API_KEY)
	req.Header.Set("Content-Type", "application/json")
	
	// ส่ง request
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call Hugging Face API: %v", err)
	}
	defer resp.Body.Close()
	
	// อ่าน response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Hugging Face API returned error (Status %d): %s", resp.StatusCode, string(body))
	}
	
	// Parse response
	var hfResponse HuggingFaceResponse
	if err := json.Unmarshal(body, &hfResponse); err != nil {
		return nil, err
	}
	
	// ประมวลผลข้อมูล
	if len(hfResponse) == 0 || len(hfResponse[0]) == 0 {
		return nil, fmt.Errorf("no emotion predictions returned")
	}
	
	emotions := hfResponse[0]
	
	// แปลงข้อมูลและเรียงลำดับ
	var emotionScores []EmotionScore
	for _, emotion := range emotions {
		emotionScores = append(emotionScores, EmotionScore{
			Emotion:              emotion.Label,
			Score:                emotion.Score,
			ConfidencePercentage: emotion.Score * 100,
		})
	}
	
	// เรียงลำดับตาม score
	sort.Slice(emotionScores, func(i, j int) bool {
		return emotionScores[i].Score > emotionScores[j].Score
	})
	
	// หา primary emotion
	primaryEmotion := emotionScores[0]
	
	result := &ProcessedEmotionResult{
		Text:           text,
		PrimaryEmotion: primaryEmotion.Emotion,
		Confidence:     primaryEmotion.ConfidencePercentage,
		SentimentScore: int(primaryEmotion.ConfidencePercentage),
		AllEmotions:    emotionScores[:min(5, len(emotionScores))], // Top 5
		ModelUsed:      "SamLowe/roberta-base-go_emotions",
	}
	
	return result, nil
}

// Helper function สำหรับ min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Update primary emotion and model version in database
func updatePrimaryEmotionAndModel(emotionAnalysisID uint, primaryEmotion, modelVersion string) error {
	db := config.DB()
	
	result := db.Model(&entity.EmotionAnalysisResults{}).
		Where("id = ?", emotionAnalysisID).
		Updates(map[string]interface{}{
			"primary_emotion": primaryEmotion,
			"modelversion":    modelVersion,
		})
	
	if result.Error != nil {
		return fmt.Errorf("failed to update primary emotion and model: %v", result.Error)
	}
	
	if result.RowsAffected == 0 {
		return fmt.Errorf("no emotion analysis record found with ID: %d", emotionAnalysisID)
	}
	
	return nil
}

// Step 4: Create SubEmotionAnalysis records
func createSubEmotionAnalysisRecords(emotionAnalysisID uint, emotions []EmotionScore) error {
	db := config.DB()
	
	// สำหรับแต่ละอารมณ์ ค้นหาหรือสร้าง emotion ในฐานข้อมูล
	for _, emotionScore := range emotions {
		// ค้นหา emotion ในฐานข้อมูล
		var emotion entity.Emotions
		err := db.Where("emotionsname = ?", emotionScore.Emotion).First(&emotion).Error
		if err != nil {
			// ถ้าไม่เจอ emotion ใน DB สร้างใหม่
			emotion = entity.Emotions{
				Emotionsname: emotionScore.Emotion,
				Category:     getCategoryFromEmotion(emotionScore.Emotion),
			}
			if err := db.Create(&emotion).Error; err != nil {
				return fmt.Errorf("failed to create emotion %s: %v", emotionScore.Emotion, err)
			}
		}
		
		// สร้าง SubEmotionAnalysis record
		subEmotionAnalysis := entity.SubEmotionAnalysis{
			ConfidencePercentage:     emotionScore.ConfidencePercentage,
			Score:                    emotionScore.Score,
			EmotionAnalysisResultsID: emotionAnalysisID,
			EmotionsID:               emotion.ID,
		}
		
		if err := db.Create(&subEmotionAnalysis).Error; err != nil {
			return fmt.Errorf("failed to create sub emotion analysis for %s: %v", emotionScore.Emotion, err)
		}
	}
	
	return nil
}

// Helper function สำหรับจัดหมวดหมู่ emotion (GoEmotions labels)
func getCategoryFromEmotion(emotion string) string {
	positiveEmotions := []string{
		"admiration", "amusement", "approval", "caring", "curiosity", "desire",
		"excitement", "gratitude", "joy", "love", "optimism", "pride", "relief",
	}
	
	negativeEmotions := []string{
		"anger", "annoyance", "disappointment", "disapproval", "disgust", 
		"embarrassment", "fear", "grief", "nervousness", "remorse", "sadness",
	}

	for _, pos := range positiveEmotions {
		if emotion == pos {
			return "Positive"
		}
	}

	for _, neg := range negativeEmotions {
		if emotion == neg {
			return "Negative"
		}
	}

	return "Neutral"
}

// POST /emotion-analysis-translate/:id - Step 2 only: Translate existing emotion analysis
func TranslateEmotionAnalysis(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get existing emotion analysis record
	emotionAnalysis, err := getEmotionAnalysisByID(uint(emotionAnalysisID))
	if err != nil {
		if err.Error() == "emotion analysis not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if already translated
	if emotionAnalysis.TranslatedText != "" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Emotion analysis already translated",
			"existing_translation": emotionAnalysis.TranslatedText,
		})
		return
	}

	// Translate text
	translatedText, err := translateTextToEnglish(emotionAnalysis.InputText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	// Update with translated text
	err = updateEmotionAnalysisTranslation(uint(emotionAnalysisID), translatedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation: " + err.Error()})
		return
	}

	// Update object for response
	emotionAnalysis.TranslatedText = translatedText

	// Clean translated text for emotion analysis
	cleanedText := cleanTextForEmotionAnalysis(translatedText)

	c.JSON(http.StatusOK, gin.H{
		"message": "Translation completed successfully",
		"data":    emotionAnalysis,
		"debug_info": gin.H{
			"original_translated": translatedText,
			"cleaned_for_analysis": cleanedText,
		},
	})
}

// POST /emotion-analysis-analyze/:id - Step 3 & 4 only: Analyze emotions for existing translated record
func AnalyzeEmotionsOnly(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get existing emotion analysis record
	emotionAnalysis, err := getEmotionAnalysisByID(uint(emotionAnalysisID))
	if err != nil {
		if err.Error() == "emotion analysis not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if translated text exists
	if emotionAnalysis.TranslatedText == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No translated text available for emotion analysis",
		})
		return
	}

	// Check if already analyzed
	if emotionAnalysis.PrimaryEmotion != "" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Emotion analysis already completed",
			"existing_primary_emotion": emotionAnalysis.PrimaryEmotion,
		})
		return
	}

	// Clean text for analysis
	cleanedText := cleanTextForEmotionAnalysis(emotionAnalysis.TranslatedText)

	// Step 3: Analyze emotions
	emotionResults, err := analyzeEmotionWithHuggingFace(cleanedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Emotion analysis failed: " + err.Error()})
		return
	}

	// Update primary emotion and model
	err = updatePrimaryEmotionAndModel(uint(emotionAnalysisID), emotionResults.PrimaryEmotion, emotionResults.ModelUsed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update primary emotion: " + err.Error()})
		return
	}

	// Step 4: Create SubEmotionAnalysis records
	err = createSubEmotionAnalysisRecords(uint(emotionAnalysisID), emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sub-emotion analysis: " + err.Error()})
		return
	}

	// Update object for response
	emotionAnalysis.PrimaryEmotion = emotionResults.PrimaryEmotion
	emotionAnalysis.Modelversion = emotionResults.ModelUsed

	c.JSON(http.StatusOK, gin.H{
		"message": "Emotion analysis completed successfully",
		"data":    emotionAnalysis,
		"emotion_results": gin.H{
			"primary_emotion": emotionResults.PrimaryEmotion,
			"confidence":      emotionResults.Confidence,
			"model_used":      emotionResults.ModelUsed,
			"sub_emotions":    emotionResults.AllEmotions,
		},
		"ai_analysis": emotionResults,
		"debug_info": gin.H{
			"cleaned_text_used": cleanedText,
		},
	})
}

// Step 5: Update Patient StatusEmotion based on PrimaryEmotion category
// func updatePatientStatusEmotion(patientID uint, primaryEmotion string) error {
// 	db := config.DB()
	
// 	// Get current patient data
// 	var patient entity.Patients
// 	result := db.First(&patient, patientID)
// 	if result.Error != nil {
// 		return fmt.Errorf("patient not found: %v", result.Error)
// 	}
	
// 	// Get emotion category from primary emotion
// 	emotionCategory := getCategoryFromEmotion(primaryEmotion)
	
// 	var updateData map[string]interface{}
	
// 	switch emotionCategory {
// 	case "Negative":
// 		// เพิ่ม StatusEmotion ขึ้น 1
// 		newStatusEmotion := patient.StatusEmotion + 1
// 		updateData = map[string]interface{}{
// 			"status_emotion": newStatusEmotion,
// 		}
		
// 	case "Positive":
// 		// เซ็ท StatusEmotion กลับเป็น 0
// 		updateData = map[string]interface{}{
// 			"status_emotion": 0,
// 		}
		
// 	default:
// 		// Neutral หรืออื่นๆ - ไม่ทำอะไร
// 		return nil
// 	}
	
// 	// Update patient StatusEmotion
// 	result = db.Model(&entity.Patients{}).
// 		Where("id = ?", patientID).
// 		Updates(updateData)
	
// 	if result.Error != nil {
// 		return fmt.Errorf("failed to update patient status emotion: %v", result.Error)
// 	}
	
// 	if result.RowsAffected == 0 {
// 		return fmt.Errorf("no patient record updated with ID: %d", patientID)
// 	}
	
// 	return nil
// }

// Helper function to get emotion analysis by ID
func getEmotionAnalysisByID(emotionAnalysisID uint) (*entity.EmotionAnalysisResults, error) {
	db := config.DB()
	
	var emotionAnalysis entity.EmotionAnalysisResults
	result := db.First(&emotionAnalysis, emotionAnalysisID)
	if result.Error != nil {
		return nil, fmt.Errorf("emotion analysis not found")
	}
	
	if emotionAnalysis.ID == 0 {
		return nil, fmt.Errorf("emotion analysis not found")
	}
	
	return &emotionAnalysis, nil
}

// GET /emotion-analysis/:id/sub-emotions - Get all sub-emotion analysis for a record
func GetSubEmotionAnalysis(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get sub emotion analysis records
	subEmotions, err := getSubEmotionAnalysisByEmotionAnalysisID(uint(emotionAnalysisID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(subEmotions) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "No sub-emotion analysis found for this emotion analysis ID",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"emotion_analysis_id": emotionAnalysisID,
		"sub_emotions": subEmotions,
		"total_count": len(subEmotions),
	})
}

// Helper function to get sub emotion analysis by emotion analysis ID
func getSubEmotionAnalysisByEmotionAnalysisID(emotionAnalysisID uint) ([]entity.SubEmotionAnalysis, error) {
	db := config.DB()
	
	var subEmotions []entity.SubEmotionAnalysis
	result := db.Where("emotion_analysis_results_id = ?", emotionAnalysisID).
		Order("confidence_percentage DESC").
		Preload("Emotions").
		Find(&subEmotions)
	
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get sub emotion analysis: %v", result.Error)
	}
	
	return subEmotions, nil
}

// GET /emotion-analysis/:id/complete - Get complete emotion analysis with sub-emotions
func GetCompleteEmotionAnalysis(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get main emotion analysis record
	emotionAnalysis, err := getEmotionAnalysisByID(uint(emotionAnalysisID))
	if err != nil {
		if err.Error() == "emotion analysis not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get sub emotion analysis records
	subEmotions, err := getSubEmotionAnalysisByEmotionAnalysisID(uint(emotionAnalysisID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get cleaned text
	cleanedText := ""
	if emotionAnalysis.TranslatedText != "" {
		cleanedText = cleanTextForEmotionAnalysis(emotionAnalysis.TranslatedText)
	}

	c.JSON(http.StatusOK, gin.H{
		"emotion_analysis": emotionAnalysis,
		"sub_emotions": subEmotions,
		"analysis_summary": gin.H{
			"total_sub_emotions": len(subEmotions),
			"primary_emotion": emotionAnalysis.PrimaryEmotion,
			"model_used": emotionAnalysis.Modelversion,
			"has_translation": emotionAnalysis.TranslatedText != "",
			"cleaned_text": cleanedText,
		},
	})
}

// POST /emotion-analysis-create-thought-record/:id - Create emotion analysis from thought record (Complete Flow)
// Modified CreateEmotionAnalysisFromThoughtRecord function for complete flow
func CreateEmotionAnalysisFromThoughtRecord(c *gin.Context) {
	// Get thought record ID from path parameter
	thoughtRecordIDStr := c.Param("id")
	thoughtRecordID, err := strconv.ParseUint(thoughtRecordIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid thought record ID format",
		})
		return
	}

	// Check if ThoughtRecord already has emotions analyzed
	hasEmotions, err := checkThoughtRecordHasEmotions(uint(thoughtRecordID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check thought record emotions: " + err.Error(),
		})
		return
	}

	if hasEmotions {
		c.JSON(http.StatusConflict, gin.H{
			"error": "มีอารมณ์อยู่แล้ว",
		})
		return
	}

	// Step 1: Get thought record content and create initial emotion analysis record
	emotionAnalysis, err := createEmotionAnalysisFromThoughtRecord(uint(thoughtRecordID))
	if err != nil {
		if err.Error() == "thought record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Thought record not found"})
			return
		}
		if err.Error() == "thought record has no content" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Thought record content is empty"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Step 2: Translate text using Google Translate API
	translatedText, err := translateTextToEnglish(emotionAnalysis.InputText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	// Update emotion analysis with translated text
	err = updateEmotionAnalysisTranslation(emotionAnalysis.ID, translatedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation: " + err.Error()})
		return
	}

	// Update the object for response
	emotionAnalysis.TranslatedText = translatedText

	// Step 3: Clean text and analyze emotions using Hugging Face API
	cleanedText := cleanTextForEmotionAnalysis(translatedText)
	emotionResults, err := analyzeEmotionWithHuggingFace(cleanedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Emotion analysis failed: " + err.Error()})
		return
	}

	// Update primary emotion and model version
	err = updatePrimaryEmotionAndModel(emotionAnalysis.ID, emotionResults.PrimaryEmotion, emotionResults.ModelUsed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update primary emotion: " + err.Error()})
		return
	}

	// Step 4: Create SubEmotionAnalysis records
	err = createSubEmotionAnalysisRecords(emotionAnalysis.ID, emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sub-emotion analysis: " + err.Error()})
		return
	}

	// Step 5: Update Patient StatusEmotion based on PrimaryEmotion
	// err = updatePatientStatusEmotion(emotionAnalysis.PatientID, emotionResults.PrimaryEmotion)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient status emotion: " + err.Error()})
	// 	return
	// }

	// Step 6: Create ThoughtRecord-Emotions many-to-many relationships (top 3 emotions)
	err = createThoughtRecordEmotionsRelationships(uint(thoughtRecordID), emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thought record emotions relationships: " + err.Error()})
		return
	}

	// Update the object for response
	emotionAnalysis.PrimaryEmotion = emotionResults.PrimaryEmotion
	emotionAnalysis.Modelversion = emotionResults.ModelUsed

	// Get updated patient status for response
	var updatedPatient entity.Patients
	db := config.DB()
	db.First(&updatedPatient, emotionAnalysis.PatientID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Emotion analysis from thought record completed successfully",
		"data":    emotionAnalysis,
		"emotion_results": gin.H{
			"primary_emotion": emotionResults.PrimaryEmotion,
			"confidence":      emotionResults.Confidence,
			"model_used":      emotionResults.ModelUsed,
			"sub_emotions_count": len(emotionResults.AllEmotions),
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"patient_status_update": gin.H{
			"patient_id": emotionAnalysis.PatientID,
			// "new_status_emotion": updatedPatient.StatusEmotion,
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"ai_analysis": emotionResults,
		"debug_info": gin.H{
			"original_translated": translatedText,
			"cleaned_for_analysis": cleanedText,
			"source_type": "thought_record",
			"top_3_emotions_saved": min(3, len(emotionResults.AllEmotions)),
		},
	}) 
}

// Step 1: Get thought record content and create emotion analysis record
func createEmotionAnalysisFromThoughtRecord(thoughtRecordID uint) (*entity.EmotionAnalysisResults, error) {
	db := config.DB()

	// Get thought record from database with TherapyCase relationship to access PatientID
	var thoughtRecord entity.ThoughtRecord
	result := db.Preload("TherapyCase").First(&thoughtRecord, thoughtRecordID)
	if result.Error != nil {
		return nil, fmt.Errorf("thought record not found")
	}
	
	if thoughtRecord.ID == 0 {
		return nil, fmt.Errorf("thought record not found")
	}

	// Combine AlternateThought and Behaviors text
	combinedText := combineThoughtRecordText(thoughtRecord.AlternateThought, thoughtRecord.Behaviors)
	if combinedText == "" {
		return nil, fmt.Errorf("thought record has no content")
	}

	// Check if TherapyCase exists and has PatientID
	if thoughtRecord.TherapyCase.PatientID == 0 {
		return nil, fmt.Errorf("thought record is not associated with any patient")
	}

	// Create emotion analysis record with combined text and PatientID
	emotionAnalysis := entity.EmotionAnalysisResults{
		DiaryID:           0, // ไม่ได้มาจาก diary
		ThoughtRecordID:   thoughtRecordID,
		InputText:         combinedText,
		PatientID:         thoughtRecord.TherapyCase.PatientID,
		AnalysisTimestamp: time.Now(),
	}

	if err := db.Create(&emotionAnalysis).Error; err != nil {
		return nil, fmt.Errorf("failed to create emotion analysis: %v", err)
	}

	return &emotionAnalysis, nil
}

// Helper function to combine AlternateThought and Behaviors text
func combineThoughtRecordText(alternateThought, behaviors string) string {
	var combinedParts []string
	
	// Add AlternateThought if not empty
	if strings.TrimSpace(alternateThought) != "" {
		combinedParts = append(combinedParts, strings.TrimSpace(alternateThought))
	}
	
	// Add Behaviors if not empty
	if strings.TrimSpace(behaviors) != "" {
		combinedParts = append(combinedParts, strings.TrimSpace(behaviors))
	}
	
	// Join with space if both exist
	if len(combinedParts) == 0 {
		return ""
	}
	
	return strings.Join(combinedParts, " ")
}

// POST /emotion-analysis-translate-thought-record/:id - Translate existing thought record emotion analysis
func TranslateThoughtRecordEmotionAnalysis(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get existing emotion analysis record
	emotionAnalysis, err := getEmotionAnalysisByID(uint(emotionAnalysisID))
	if err != nil {
		if err.Error() == "emotion analysis not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if this is from thought record
	if emotionAnalysis.ThoughtRecordID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This emotion analysis is not from a thought record",
		})
		return
	}

	// Check if already translated
	if emotionAnalysis.TranslatedText != "" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Emotion analysis already translated",
			"existing_translation": emotionAnalysis.TranslatedText,
		})
		return
	}

	// Translate text
	translatedText, err := translateTextToEnglish(emotionAnalysis.InputText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Translation failed: " + err.Error()})
		return
	}

	// Update with translated text
	err = updateEmotionAnalysisTranslation(uint(emotionAnalysisID), translatedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update translation: " + err.Error()})
		return
	}

	// Update object for response
	emotionAnalysis.TranslatedText = translatedText

	// Clean translated text for emotion analysis
	cleanedText := cleanTextForEmotionAnalysis(translatedText)

	c.JSON(http.StatusOK, gin.H{
		"message": "Thought record emotion analysis translation completed successfully",
		"data":    emotionAnalysis,
		"debug_info": gin.H{
			"original_translated": translatedText,
			"cleaned_for_analysis": cleanedText,
			"source_type": "thought_record",
		},
	})
}

// POST /emotion-analysis-analyze-thought-record/:id - Analyze emotions for existing translated thought record
func AnalyzeThoughtRecordEmotionsOnly(c *gin.Context) {
	emotionAnalysisIDStr := c.Param("id")
	emotionAnalysisID, err := strconv.ParseUint(emotionAnalysisIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid emotion analysis ID format",
		})
		return
	}

	// Get existing emotion analysis record
	emotionAnalysis, err := getEmotionAnalysisByID(uint(emotionAnalysisID))
	if err != nil {
		if err.Error() == "emotion analysis not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Check if this is from thought record
	if emotionAnalysis.ThoughtRecordID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This emotion analysis is not from a thought record",
		})
		return
	}

	// Check if ThoughtRecord already has emotions analyzed
	hasEmotions, err := checkThoughtRecordHasEmotions(emotionAnalysis.ThoughtRecordID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to check thought record emotions: " + err.Error(),
		})
		return
	}

	if hasEmotions {
		c.JSON(http.StatusConflict, gin.H{
			"error": "มีอารมณ์อยู่แล้ว",
		})
		return
	}

	// Check if translated text exists
	if emotionAnalysis.TranslatedText == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No translated text available for emotion analysis",
		})
		return
	}

	// Check if already analyzed
	if emotionAnalysis.PrimaryEmotion != "" {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Emotion analysis already completed",
			"existing_primary_emotion": emotionAnalysis.PrimaryEmotion,
		})
		return
	}

	// Clean text for analysis
	cleanedText := cleanTextForEmotionAnalysis(emotionAnalysis.TranslatedText)

	// Step 3: Analyze emotions
	emotionResults, err := analyzeEmotionWithHuggingFace(cleanedText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Emotion analysis failed: " + err.Error()})
		return
	}

	// Update primary emotion and model
	err = updatePrimaryEmotionAndModel(uint(emotionAnalysisID), emotionResults.PrimaryEmotion, emotionResults.ModelUsed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update primary emotion: " + err.Error()})
		return
	}

	// Step 4: Create SubEmotionAnalysis records
	err = createSubEmotionAnalysisRecords(uint(emotionAnalysisID), emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sub-emotion analysis: " + err.Error()})
		return
	}

	// Step 5: Update Patient StatusEmotion based on PrimaryEmotion
	// err = updatePatientStatusEmotion(emotionAnalysis.PatientID, emotionResults.PrimaryEmotion)
	// if err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient status emotion: " + err.Error()})
	// 	return
	// }

	// Step 6: Create ThoughtRecord-Emotions many-to-many relationships (top 3 emotions)
	err = createThoughtRecordEmotionsRelationships(emotionAnalysis.ThoughtRecordID, emotionResults.AllEmotions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thought record emotions relationships: " + err.Error()})
		return
	}

	// Update object for response
	emotionAnalysis.PrimaryEmotion = emotionResults.PrimaryEmotion
	emotionAnalysis.Modelversion = emotionResults.ModelUsed

	// Get updated patient status for response
	var updatedPatient entity.Patients
	db := config.DB()
	db.First(&updatedPatient, emotionAnalysis.PatientID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Thought record emotion analysis completed successfully",
		"data":    emotionAnalysis,
		"emotion_results": gin.H{
			"primary_emotion": emotionResults.PrimaryEmotion,
			"confidence":      emotionResults.Confidence,
			"model_used":      emotionResults.ModelUsed,
			"sub_emotions":    emotionResults.AllEmotions,
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"patient_status_update": gin.H{
			"patient_id": emotionAnalysis.PatientID,
			// "new_status_emotion": updatedPatient.StatusEmotion,
			"emotion_category": getCategoryFromEmotion(emotionResults.PrimaryEmotion),
		},
		"ai_analysis": emotionResults,
		"debug_info": gin.H{
			"cleaned_text_used": cleanedText,
			"source_type": "thought_record",
			"top_3_emotions_saved": min(3, len(emotionResults.AllEmotions)),
		},
	})
}

// Helper function to update ThoughtRecord's EmotionsID based on primary emotion
func updateThoughtRecordEmotionsID(thoughtRecordID uint, primaryEmotion string) error {
	db := config.DB()
	
	// Find emotion by emotionsname that matches primary_emotion
	var emotion entity.Emotions
	result := db.Where("emotionsname = ?", primaryEmotion).First(&emotion)
	if result.Error != nil {
		// If emotion not found, create a new one
		emotion = entity.Emotions{
			Emotionsname: primaryEmotion,
			Category:     getCategoryFromEmotion(primaryEmotion),
		}
		if err := db.Create(&emotion).Error; err != nil {
			return fmt.Errorf("failed to create emotion %s: %v", primaryEmotion, err)
		}
	}
	
	// Update ThoughtRecord's EmotionsID
	updateResult := db.Model(&entity.ThoughtRecord{}).
		Where("id = ?", thoughtRecordID).
		Update("emotions_id", emotion.ID)
	
	if updateResult.Error != nil {
		return fmt.Errorf("failed to update thought record emotions ID: %v", updateResult.Error)
	}
	
	if updateResult.RowsAffected == 0 {
		return fmt.Errorf("no thought record found with ID: %d", thoughtRecordID)
	}
	
	return nil
}
// Helper function to create ThoughtRecord-Emotions many-to-many relationships for top 3 emotions
func createThoughtRecordEmotionsRelationships(thoughtRecordID uint, emotions []EmotionScore) error {
	db := config.DB()
	
	// Get top 3 emotions
	topEmotions := emotions
	if len(emotions) > 3 {
		topEmotions = emotions[:3]
	}
	
	// Create relationships for each of the top 3 emotions
	for _, emotionScore := range topEmotions {
		// Find or create emotion in database
		var emotion entity.Emotions
		err := db.Where("emotionsname = ?", emotionScore.Emotion).First(&emotion).Error
		if err != nil {
			// If emotion not found, create a new one
			emotion = entity.Emotions{
				Emotionsname: emotionScore.Emotion,
				Category:     getCategoryFromEmotion(emotionScore.Emotion),
				// Add ThaiEmotionsname and EmotionsColor if needed
				ThaiEmotionsname: "", // You might want to add translation logic here
				EmotionsColor:    "", // You might want to add color mapping logic here
			}
			if err := db.Create(&emotion).Error; err != nil {
				return fmt.Errorf("failed to create emotion %s: %v", emotionScore.Emotion, err)
			}
		}
		
		// Create the many-to-many relationship in thoughtrecord_emotions table
		err = db.Exec("INSERT INTO thoughtrecord_emotions (thought_record_id, emotions_id) VALUES (?, ?)", 
			thoughtRecordID, emotion.ID).Error
		if err != nil {
			return fmt.Errorf("failed to create thought record-emotion relationship for %s: %v", emotionScore.Emotion, err)
		}
	}
	
	return nil
}
// Helper function to check if ThoughtRecord already has emotions in many-to-many relationship
func checkThoughtRecordHasEmotions(thoughtRecordID uint) (bool, error) {
	db := config.DB()
	
	var count int64
	err := db.Table("thoughtrecord_emotions").
		Where("thought_record_id = ?", thoughtRecordID).
		Count(&count).Error
	
	if err != nil {
		return false, fmt.Errorf("failed to check thought record emotions: %v", err)
	}
	
	return count > 0, nil
}

