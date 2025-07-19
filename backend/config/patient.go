package config

import (
	"time"
	"capstone-project/entity"
)

func SetupPatientDatabase() {
	db.AutoMigrate(
       &entity.Patients{},
       &entity.Genders{},
       &entity.Roles{},
	   &entity.Admin{},
   	)

   	GenderMale := entity.Genders{Gender: "Male"}
   	GenderFemale := entity.Genders{Gender: "Female"}
    GenderOther := entity.Genders{Gender: "Other"} // ✅ เพิ่มบรรทัดนี้
   	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
   	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})
    db.FirstOrCreate(&GenderOther, &entity.Genders{Gender: "Other"}) // ✅ เพิ่มบรรทัดนี้
    

    Unknown := entity.Roles{Role: "Unknown"}
    Admin := entity.Roles{Role: "Admin"}
   	Patient := entity.Roles{Role: "Patient"}
  	Psychologist := entity.Roles{Role: "Psychologist"}
   	db.FirstOrCreate(&Unknown, &entity.Roles{Role: "Unknown"})
   	db.FirstOrCreate(&Admin, &entity.Roles{Role: "Admin"})
   	db.FirstOrCreate(&Patient, &entity.Roles{Role: "Patient"})
   	db.FirstOrCreate(&Psychologist, &entity.Roles{Role: "Psychologist"})

	
  	hashedPassword01, _ := HashPassword("123")
   	BirthDay01, _ := time.Parse("2006-01-02", "1988-11-12")
   	Patients := &entity.Patients{
       FirstName: 	"Patient",
       LastName:  	"testing",
       Email:     	"pattest@gmail.com",
       Age:       	80,
       Password:  	hashedPassword01,
       BirthDay:  	BirthDay01,
       Phone:     	"0979989859",
	   Image: 		"https://static.vecteezy.com/system/resources/previews/002/275/847/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg",
       GenderID:  	1,
       RoleID: 		3,
   	}
    db.FirstOrCreate(Patients, &entity.Patients{Email: "pattest@gmail.com",})

  	hashedPassword02, _ := HashPassword("123")
   	BirthDay02, _ := time.Parse("2006-01-02", "1988-11-12")
   	Psychologists := &entity.Patients{
       FirstName: 	"Psychologist",
       LastName:  	"testing",
       Email:     	"psytest@gmail.com",
       Age:       	80,
       Password:  	hashedPassword02,
       BirthDay:  	BirthDay02,
       Phone:     	"0979989859",
	   Image: 		"https://static.vecteezy.com/system/resources/previews/002/275/847/original/male-avatar-profile-icon-of-smiling-caucasian-man-vector.jpg",
       GenderID:  	2,
       RoleID: 		4,
   	}
    db.FirstOrCreate(Psychologists, &entity.Patients{Email: "psytest@gmail.com",})

    PatientOther := &entity.Patients{
	FirstName: "Alex",
	LastName:  "Taylor",
	Email:     "otheruser@gmail.com",
	Age:       28,
	Password:  hashedPassword01,
	BirthDay:  BirthDay01,
	Phone:     "0988888888",
	Image:     "https://example.com/avatar-other.jpg",
	GenderID:  3,              // ✅ เพศ Other
	RoleID:    3,              // Patient
}
    db.FirstOrCreate(PatientOther, &entity.Patients{Email: "otheruser@gmail.com"})

}