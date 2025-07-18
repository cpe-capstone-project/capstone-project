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

	// ตัวอย่างรหัสผ่านและวันเกิด
password, _ := HashPassword("123456")
dob, _ := time.Parse("2006-01-02", "1990-05-20")

// 👇 สร้าง Verify Code เฉพาะบุคคล และ Hash ก่อนใส่
pin1, _ := HashPassword("243784")
pin2, _ := HashPassword("912356")
pin3, _ := HashPassword("601124")
pin4, _ := HashPassword("775533")

// ✅ Psychologist 1
psychologist1 := &entity.Psychologist{
	FirstName:       "Dr.",
	LastName:        "MindCare",
	DOB:             dob,
	Phone:           "090-234-1232",
	MedicalLicense:  "PsyRef123-123-456-3334",
	Email:           "drmind@depressionrec.go.th",
	PasswordHash:    password,
	LicenseImage:    "https://example.com/license1.jpg",
	GenderID:        genderFemale.ID,
	RoleID:          rolePsychologist.ID,
	VerifyCodeHash:  pin1,
}
db.FirstOrCreate(psychologist1, entity.Psychologist{Email: psychologist1.Email})

// ✅ Psychologist 2
psychologist2 := &entity.Psychologist{
	FirstName:       "Mr.",
	LastName:        "ThinkWise",
	DOB:             dob,
	Phone:           "092-888-1123",
	MedicalLicense:  "PsyRef321-456-789-0001",
	Email:           "thinkwise@depressionrec.go.th",
	PasswordHash:    password,
	LicenseImage:    "https://example.com/license2.jpg",
	GenderID:        genderMale.ID,
	RoleID:          rolePsychologist.ID,
	VerifyCodeHash:  pin2,
}
db.FirstOrCreate(psychologist2, entity.Psychologist{Email: psychologist2.Email})

// ✅ Psychologist 3
psychologist3 := &entity.Psychologist{
	FirstName:       "Alex",
	LastName:        "Flow",
	DOB:             dob,
	Phone:           "091-777-4477",
	MedicalLicense:  "PsyRef001-002-003-0044",
	Email:           "alexflow@depressionrec.go.th",
	PasswordHash:    password,
	LicenseImage:    "https://example.com/license3.jpg",
	GenderID:        genderOther.ID,
	RoleID:          rolePsychologist.ID,
	VerifyCodeHash:  pin3,
}
db.FirstOrCreate(psychologist3, entity.Psychologist{Email: psychologist3.Email})

// ✅ Psychologist 4
passwordNew, _ := HashPassword("psychohealth111")
psychologist4 := &entity.Psychologist{
	FirstName:       "Dr.",
	LastName:        "Medicine",
	DOB:             dob,
	Phone:           "093-666-8899",
	MedicalLicense:  "PsyRef555-666-777-8888",
	Email:           "medicine@depressionrec.go.th",
	PasswordHash:    passwordNew,
	LicenseImage:    "https://example.com/license4.jpg",
	GenderID:        genderMale.ID,
	RoleID:          rolePsychologist.ID,
	VerifyCodeHash:  pin4,
}
db.FirstOrCreate(psychologist4, entity.Psychologist{Email: psychologist4.Email})
}
