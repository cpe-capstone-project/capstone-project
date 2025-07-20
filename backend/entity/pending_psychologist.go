package entity

import "time"

type PendingPsychologist struct {
    ID              uint      `gorm:"primaryKey"`
    FirstName       string
    LastName        string
    Age             int
    GenderID        uint
    DOB             time.Time
    Phone           string
    MedicalLicense  string
    Email           string    `gorm:"unique"`
    PasswordHash    string
    LicenseImage    string
    RoleID          uint
    CreatedAt       time.Time
	Gender   Genders `gorm:"foreignKey:GenderID"`
}
