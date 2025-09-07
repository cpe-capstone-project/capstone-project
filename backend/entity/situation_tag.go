package entity

import "gorm.io/gorm"

type SituationTag struct {
    gorm.Model
    Name          string `gorm:"unique;not null"`
    Color         string
    IsUserCreated bool `gorm:"default:false"` // ✅ เพิ่ม field นี้

    // Relations
    ThoughtRecords []ThoughtRecord `gorm:"foreignKey:SituationTagID"`
}
