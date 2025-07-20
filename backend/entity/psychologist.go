package entity

import (
	"time"

	"gorm.io/gorm"
)

type Psychologist struct {
	gorm.Model
	FirstName      string
	LastName       string
	DOB            time.Time
	Age            int
	Phone          string    `gorm:"unique"`
	MedicalLicense string    `gorm:"unique"`
	Email          string    `gorm:"unique"`
	PasswordHash   string
	LicenseImage   string

	GenderID uint
	Gender   *Genders

	RoleID uint
	Role   *Roles

	VerifyCodeHash string // ✅ ใหม่: เก็บ PIN แบบ hash
}

//