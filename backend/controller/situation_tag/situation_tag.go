package situation_tag

import (
    "capstone-project/config"
    "capstone-project/entity"
    "net/http"

    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

// GET /situation-tags
func ListSituationTags(c *gin.Context) {
    var tags []entity.SituationTag
    db := config.DB()
    if err := db.Find(&tags).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, tags)
}

// POST /situation-tags
func CreateSituationTag(c *gin.Context) {
    var input struct {
        Name  string `json:"Name" binding:"required"`
        Color string `json:"Color"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    db := config.DB()

    // ตรวจสอบ tag เดิม (รวม soft deleted)
    var existingTag entity.SituationTag
    if err := db.Unscoped().Where("name = ?", input.Name).First(&existingTag).Error; err == nil {
        // พบ tag เดิมที่ soft deleted -> restore
        existingTag.DeletedAt = gorm.DeletedAt{} // ✅ restore
        existingTag.Color = input.Color
        existingTag.IsUserCreated = true
        if err := db.Unscoped().Save(&existingTag).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        c.JSON(http.StatusCreated, existingTag)
        return
    }

    // สร้าง tag ใหม่
    tag := entity.SituationTag{
        Name:          input.Name,
        Color:         input.Color,
        IsUserCreated: true,
    }

    if err := db.Create(&tag).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, tag)
}

// DELETE /situation-tags/:id
func DeleteSituationTag(c *gin.Context) {
    id := c.Param("id")
    db := config.DB()

    var tag entity.SituationTag
    if err := db.First(&tag, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "situation tag not found"})
        return
    }

    if !tag.IsUserCreated {
        c.JSON(http.StatusForbidden, gin.H{"error": "cannot delete system tag"})
        return
    }

    if err := db.Delete(&tag).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}
