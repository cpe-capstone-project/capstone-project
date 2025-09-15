package emotion

import (
	"capstone-project/config"
	"capstone-project/entity"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /emotion/:id
func GetEmotionByID(c *gin.Context){
	ID := c.Param("id")
	var emotion entity.Emotions

	db := config.DB()
	results := db.First(&emotion, ID)
	if results.Error != nil{
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	if emotion.ID == 0{
		c.JSON(http.StatusNoContent, gin.H{"error": "Emotion not found"})
		return
	}
	c.JSON(http.StatusOK, emotion)
}

// สร้าง struct สำหรับ response
type EmotionsResponse struct {
    EmotionsName     string `json:"emotions_name"`
    Category         string `json:"category"`
    ThaiEmotionsName string `json:"thai_emotions_name"`
    EmotionsColor    string `json:"emotion_color"`
}

func GetAllEmotions(c *gin.Context) {
    var emotions []entity.Emotions

    db := config.DB()
    results := db.Find(&emotions)
    if results.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
        return
    }

    // แปลงข้อมูลเป็น response format
    var response []EmotionsResponse
    for _, emotion := range emotions {
        response = append(response, EmotionsResponse{
            EmotionsName:     emotion.Emotionsname,
            Category:         emotion.Category,
            ThaiEmotionsName: emotion.ThaiEmotionsname,
            EmotionsColor:    emotion.EmotionsColor,
        })
    }

    c.JSON(http.StatusOK, response)
}