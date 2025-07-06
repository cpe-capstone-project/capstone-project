package entity

import "time"
import "gorm.io/gorm"

type Patients struct {
  gorm.Model
  FirstName string
  LastName  string
  Email     string
  Phone     string
  Age       uint8
  BirthDay  time.Time
  Password  string
  Image     string
  Consent   bool
  Address   string
  GenderID  uint
  Gender    *Genders
  RoleID    uint
  Role      *Roles
}
//