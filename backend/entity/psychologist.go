// entity/psychologist.go
package entity

import (
	"time"

	"gorm.io/gorm"
)

type Psychologist struct {
	gorm.Model
	FirstName      string    `gorm:"size:100;not null"`       // ชื่อ
	LastName       string    `gorm:"size:100;not null"`       // นามสกุล
	Gender         string    `gorm:"size:10;not null"`        // เพศ (male/female/other)
	DOB            time.Time `gorm:"not null"`                // วันเกิด
	Phone          string    `gorm:"size:15;not null;unique"` // เบอร์โทรศัพท์
	MedicalLicense string    `gorm:"size:21;not null;unique"` // เลขที่ใบรับรองแพทย์
	Email          string    `gorm:"size:100;not null;unique"`// อีเมล
	PasswordHash   string    `gorm:"size:255;not null"`       // รหัสผ่านแฮช
	LicenseImage   string    `gorm:"size:255;not null"`       // ชื่อไฟล์หรือ path ของรูปใบรับรองแพทย์
}