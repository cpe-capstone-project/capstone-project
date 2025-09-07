// backend/test/psychologist_register_test.go
package unit

import (
	"errors"
	"regexp"
	"testing"
	"time"

	. "github.com/onsi/gomega"

	"capstone-project/entity"
)

func validatePsychologist(ps entity.Psychologist) (bool, error) {
	if ps.FirstName == "" {
		return false, errors.New("firstName is required")
	}
	if ps.LastName == "" {
		return false, errors.New("lastName is required")
	}
	if ps.Age <= 0 {
		return false, errors.New("age must be greater than 0")
	}
	if ps.GenderID != 1 && ps.GenderID != 2 && ps.GenderID != 3 {
		return false, errors.New("genderID is invalid")
	}
	if ps.DOB.IsZero() {
		return false, errors.New("dob is required")
	}
	if !regexp.MustCompile(`^0\d{9}$`).MatchString(ps.Phone) {
		return false, errors.New("phone must be a valid thai number")
	}
	if !regexp.MustCompile(`^PsychRef\d{3}-\d{3}-\d{3}-\d{4}$`).MatchString(ps.MedicalLicense) {
		return false, errors.New("medicalLicense must match PsychRefxxx-xxx-xxx-xxxx")
	}
	if !regexp.MustCompile(`^[A-Za-z0-9._%+\-]+@depressionrec\.go\.th$`).MatchString(ps.Email) {
		return false, errors.New("email must be @depressionrec.go.th")
	}
	if ps.PasswordHash == "" {
		return false, errors.New("passwordHash is required")
	}
	if ps.LicenseImage == "" {
		return false, errors.New("licenseImage is required")
	}
	if ps.RoleID != 4 {
		return false, errors.New("roleID must be 4 for psychologist")
	}
	return true, nil
}

// ---- Tests ----
func TestPsychologistRegistrationValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("✅ should pass validation for valid psychologist", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Date(1995, 5, 1, 0, 0, 0, 0, time.UTC),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "somebcrypt-or-argon2-hash",
			LicenseImage:   "license.png",
			GenderID:       2, // female
			RoleID:         4, // Psychologist
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("❌ firstName empty", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("firstName is required")))
	})

	t.Run("❌ medical license invalid", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "Ref-123456",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("medicalLicense must match PsychRef")))
	})

	t.Run("❌ email domain invalid", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@gmail.com",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("email must be @depressionrec.go.th")))
	})

	t.Run("❌ phone invalid", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "123-456-7890",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("phone must be a valid thai number")))
	})

	t.Run("❌ roleID invalid", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         2,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("roleID must be 4 for psychologist")))
	})

	t.Run("❌ dob zero", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Time{},
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("dob is required")))
	})

	t.Run("❌ passwordHash empty", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("passwordHash is required")))
	})

	t.Run("❌ licenseImage empty", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("licenseImage is required")))
	})

	t.Run("❌ genderID invalid", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            30,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       9,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("genderID is invalid")))
	})

	t.Run("❌ age <= 0", func(t *testing.T) {
		ps := entity.Psychologist{
			FirstName:      "Alice",
			LastName:       "Smith",
			DOB:            time.Now(),
			Age:            0,
			Phone:          "0812345678",
			MedicalLicense: "PsychRef123-456-789-0001",
			Email:          "alice@depressionrec.go.th",
			PasswordHash:   "hash",
			LicenseImage:   "x.png",
			GenderID:       2,
			RoleID:         4,
		}
		ok, err := validatePsychologist(ps)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("age must be greater than 0")))
	})
}
