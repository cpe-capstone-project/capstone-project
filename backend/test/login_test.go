package unit

import (
	"errors"
	"regexp"
	"testing"

	"golang.org/x/crypto/bcrypt"
	. "github.com/onsi/gomega"

	"capstone-project/entity"
)

// -------- Service (Login Validation) --------
func ValidatePatientLogin(email, password string, stored entity.Patients) (bool, error) {
	// domain ต้องเป็น gmail.com
	if !regexp.MustCompile(`^[A-Za-z0-9._%+\-]+@gmail\.com$`).MatchString(email) {
		return false, errors.New("invalid email domain")
	}
	// compare password hash
	if err := bcrypt.CompareHashAndPassword([]byte(stored.Password), []byte(password)); err != nil {
		return false, errors.New("invalid password")
	}
	return true, nil
}

// -------- Tests --------
func TestPatientLoginValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	// สร้าง hash ของ password จริง
	hashed, _ := bcrypt.GenerateFromPassword([]byte("mypassword123"), bcrypt.DefaultCost)
	stored := entity.Patients{
		Email:    "john.doe@gmail.com",
		Password: string(hashed),
	}

	t.Run("✅ valid login", func(t *testing.T) {
		ok, err := ValidatePatientLogin("john.doe@gmail.com", "mypassword123", stored)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("❌ wrong email domain", func(t *testing.T) {
		ok, err := ValidatePatientLogin("john.doe@yahoo.com", "mypassword123", stored)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("invalid email domain")))
	})

	t.Run("❌ wrong password", func(t *testing.T) {
		ok, err := ValidatePatientLogin("john.doe@gmail.com", "wrongpass", stored)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("invalid password")))
	})
}
