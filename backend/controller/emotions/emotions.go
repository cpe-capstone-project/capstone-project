package emotions

import (
    "capstone-project/config"
    "capstone-project/entity"
    "net/http"

    "github.com/gin-gonic/gin"
)

// ฟังก์ชันสำหรับดึงอารมณ์ทั้งหมด
func GetAllEmotions(c *gin.Context) {
    var emotions []entity.Emotions
    db := config.DB()

    if err := db.Find(&emotions).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, emotions)
}