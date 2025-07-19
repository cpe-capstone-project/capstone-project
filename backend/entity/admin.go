package entity

import (
  "gorm.io/gorm"
)

type Admin struct {
  gorm.Model
  FirstName     string
  LastName      string
  Email         string `gorm:"unique"`  // ✅ ถูกต้อง
  PasswordHash  string

  RoleID        uint
  Role          *Roles

}