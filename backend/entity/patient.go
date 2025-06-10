package entity

import (
	"time"

	"gorm.io/gorm"
)
type Patients struct {
	gorm.Model
	FirstName   string  	`valid:"required~FirstName is required"`
	LastName    string  	`valid:"required~LastName is required"`
	Email       string    	`valid:"required~Email is required, email~Email is invalid"`
	Phone       string    	`valid:"required~Phone is required, stringlength(10|10)"`
	Age         uint8     	`valid:"required~Age is required,range(1|150)"`
	BirthDay    time.Time 	`valid:"required~BirthDay is required"`
	Password    string    	`valid:"required~Password is required"`
	Image     	string  	`gorm:"type:longtext" `

    GenderID  	uint      	`valid:"required~GenderID is required"`
    Gender    	*Genders  	`gorm:"foreignKey: gender_id" json:"gender"`

	RoleID    	uint      	`valid:"required~RoleID is required"`
	Role    	*Roles  	`gorm:"foreignKey: role_id" json:"role"`

}
