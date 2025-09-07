package unit

import (
	"errors"
	"regexp"
	"testing"
	"time"

	. "github.com/onsi/gomega"

	"capstone-project/entity"
	"gorm.io/datatypes"
)
func validateDailyChecklist(dc entity.DailyChecklist) (bool, error) {
	if dc.PatientID == 0 {
		return false, errors.New("patientID is required")
	}
	if dc.Date.IsZero() {
		return false, errors.New("date is required")
	}
	// tasks/done must be non-empty JSON
	if len(dc.Tasks) == 0 {
		return false, errors.New("tasks must be a non-empty json map")
	}
	if len(dc.Done) == 0 {
		return false, errors.New("done must be a non-empty json map")
	}
	// timezone
	if dc.Timezone != "" {
		iana := regexp.MustCompile(`^[A-Za-z_]+(?:/[A-Za-z_]+){1,2}$`)
		if !iana.MatchString(dc.Timezone) {
			return false, errors.New("timezone must be an iana name like Area/Location")
		}
	}
	return true, nil
}


func TestDailyChecklistValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("✅ should pass validation for valid daily checklist", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 1,
			Date:      time.Date(2025, 1, 2, 0, 0, 0, 0, time.UTC),
			Timezone:  "Asia/Bangkok",
			Tasks: datatypes.JSONMap{
				"wake_up":  "07:00",
				"exercise": true,
			},
			Done: datatypes.JSONMap{
				"wake_up":  true,
				"exercise": false,
			},
			// Version: 0 // ปล่อยให้ default ที่ DB
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("❌ should fail when PatientID is zero", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 0,
			Date:      time.Now(),
			Tasks:     datatypes.JSONMap{"a": 1},
			Done:      datatypes.JSONMap{"a": true},
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("patientID is required")))
	})

	t.Run("❌ should fail when Date is zero", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 1,
			Date:      time.Time{},
			Tasks:     datatypes.JSONMap{"a": 1},
			Done:      datatypes.JSONMap{"a": true},
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("date is required")))
	})

	t.Run("❌ should fail when Tasks is empty", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 1,
			Date:      time.Now(),
			Tasks:     datatypes.JSONMap{}, // empty
			Done:      datatypes.JSONMap{"a": true},
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("tasks must be a non-empty json map")))
	})

	t.Run("❌ should fail when Done is empty", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 1,
			Date:      time.Now(),
			Tasks:     datatypes.JSONMap{"a": 1},
			Done:      datatypes.JSONMap{}, // empty
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("done must be a non-empty json map")))
	})

	t.Run("❌ should fail when Timezone is invalid format (if provided)", func(t *testing.T) {
		dc := entity.DailyChecklist{
			PatientID: 1,
			Date:      time.Now(),
			Timezone:  "Bangkok", // invalid IANA (ควรเป็น Asia/Bangkok)
			Tasks:     datatypes.JSONMap{"a": 1},
			Done:      datatypes.JSONMap{"a": true},
		}
		ok, err := validateDailyChecklist(dc)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("timezone must be an iana name")))
	})
}
