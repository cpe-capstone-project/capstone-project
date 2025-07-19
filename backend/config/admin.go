package config

import (
	"capstone-project/entity"
	"golang.org/x/crypto/bcrypt"
)

func SetupInitialData() {

	// Hash password
	hashPassword := func(pw string) string {
		hashed, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		return string(hashed)
	}

	// ✅ Admin 1: Dev Frontend
	db.FirstOrCreate(&entity.Admin{}, entity.Admin{
		FirstName:    "Dev",
		LastName:     "Frontend",
		Email:        "spec@gmail.com",
		PasswordHash: hashPassword("mindcare"),
		RoleID:       2,
	})

	// ✅ Admin 2: Dev Backend
	db.FirstOrCreate(&entity.Admin{}, entity.Admin{
		FirstName:    "Dev",
		LastName:     "Backend",
		Email:        "aqua@gmail.com",
		PasswordHash: hashPassword("healthmate"),
		RoleID:       2,
	})
}
