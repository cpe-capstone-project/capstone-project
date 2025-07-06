package config

import (
	"time"
	"capstone-project/entity"
)

func SetupPsychologistDatabase() {
	db.AutoMigrate(
		&entity.Psychologist{},
		&entity.Genders{},
		&entity.Roles{},
	)

	// Initial Genders
	genderMale := entity.Genders{Gender: "Male"}
	genderFemale := entity.Genders{Gender: "Female"}
	genderOther := entity.Genders{Gender: "Other"}

	db.FirstOrCreate(&genderMale, entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&genderFemale, entity.Genders{Gender: "Female"})
	db.FirstOrCreate(&genderOther, entity.Genders{Gender: "Other"})

	// Initial Roles
	rolePsychologist := entity.Roles{Role: "Psychologist"}
	roleAdmin := entity.Roles{Role: "Admin"}
	roleUnknown := entity.Roles{Role: "Unknown"}
	rolePatient := entity.Roles{Role: "Patient"}

	db.FirstOrCreate(&rolePsychologist, entity.Roles{Role: "Psychologist"})
	db.FirstOrCreate(&roleAdmin, entity.Roles{Role: "Admin"})
	db.FirstOrCreate(&roleUnknown, entity.Roles{Role: "Unknown"})
	db.FirstOrCreate(&rolePatient, entity.Roles{Role: "Patient"})

	// Common password and date of birth
	password, _ := HashPassword("123456")
	dob, _ := time.Parse("2006-01-02", "1990-05-20")

	// Psychologist 1
	psychologist1 := &entity.Psychologist{
		FirstName:      "Dr.",
		LastName:       "MindCare",
		DOB:            dob,
		Phone:          "0899999999",
		MedicalLicense: "LIC-0001",
		Email:          "drmind@clinic.com",
		PasswordHash:   password,
		LicenseImage:   "https://example.com/license1.jpg",
		GenderID:       genderFemale.ID,
		RoleID:         rolePsychologist.ID,
	}
	db.FirstOrCreate(psychologist1, entity.Psychologist{Email: "drmind@clinic.com"})

	// Psychologist 2
	psychologist2 := &entity.Psychologist{
		FirstName:      "Mr.",
		LastName:       "ThinkWise",
		DOB:            dob,
		Phone:          "0888888888",
		MedicalLicense: "LIC-0002",
		Email:          "thinkwise@clinic.com",
		PasswordHash:   password,
		LicenseImage:   "https://example.com/license2.jpg",
		GenderID:       genderMale.ID,
		RoleID:         rolePsychologist.ID,
	}
	db.FirstOrCreate(psychologist2, entity.Psychologist{Email: "thinkwise@clinic.com"})

	// Psychologist 3
	psychologist3 := &entity.Psychologist{
		FirstName:      "Alex",
		LastName:       "Flow",
		DOB:            dob,
		Phone:          "0877777777",
		MedicalLicense: "LIC-0003",
		Email:          "alexflow@clinic.com",
		PasswordHash:   password,
		LicenseImage:   "https://example.com/license3.jpg",
		GenderID:       genderOther.ID,
		RoleID:         rolePsychologist.ID,
	}
	db.FirstOrCreate(psychologist3, entity.Psychologist{Email: "alexflow@clinic.com"})
}
