package unit

import (
	"errors"
	"testing"
	"time"

	. "github.com/onsi/gomega"

	"capstone-project/entity"
)

func validateRequest(r entity.Request) (bool, error) {
	if r.Type == "" {
		return false, errors.New("type is required")
	}
	if r.Detail == "" {
		return false, errors.New("detail is required")
	}
	if r.PatientID == 0 {
		return false, errors.New("patientID is required")
	}
	if r.PsychologistID == 0 {
		return false, errors.New("psychologistID is required")
	}

	// meeting time validations (optional fields)
	if r.MeetingEnd != nil && r.MeetingStart == nil {
		return false, errors.New("meetingStart is required when meetingEnd is set")
	}
	if r.MeetingStart != nil && r.MeetingEnd != nil {
		if !r.MeetingEnd.After(*r.MeetingStart) {
			return false, errors.New("meetingEnd must be after meetingStart")
		}
	}

	return true, nil
}

// ---- Tests ----
func TestRequestValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	t.Run("✅ should pass for valid request with meeting times", func(t *testing.T) {
		start := time.Now()
		end := start.Add(1 * time.Hour)
		r := entity.Request{
			Type:           "appointment",
			Detail:         "follow-up session",
			MeetingStart:   &start,
			MeetingEnd:     &end,
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("✅ should pass for valid request without meeting times", func(t *testing.T) {
		r := entity.Request{
			Type:           "question",
			Detail:         "ask about medication",
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	t.Run("❌ should fail when type is empty", func(t *testing.T) {
		r := entity.Request{
			Type:           "",
			Detail:         "something",
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("type is required")))
	})

	t.Run("❌ should fail when detail is empty", func(t *testing.T) {
		r := entity.Request{
			Type:           "appointment",
			Detail:         "",
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("detail is required")))
	})

	t.Run("❌ should fail when patientID is zero", func(t *testing.T) {
		r := entity.Request{
			Type:           "appointment",
			Detail:         "desc",
			PatientID:      0,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("patientID is required")))
	})

	t.Run("❌ should fail when psychologistID is zero", func(t *testing.T) {
		r := entity.Request{
			Type:           "appointment",
			Detail:         "desc",
			PatientID:      1,
			PsychologistID: 0,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("psychologistID is required")))
	})

	t.Run("❌ should fail when meetingEnd is set but meetingStart is nil", func(t *testing.T) {
		end := time.Now().Add(30 * time.Minute)
		r := entity.Request{
			Type:           "appointment",
			Detail:         "desc",
			MeetingStart:   nil,
			MeetingEnd:     &end,
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("meetingStart is required when meetingEnd is set")))
	})

	t.Run("❌ should fail when meetingEnd is before meetingStart", func(t *testing.T) {
		start := time.Now()
		end := start.Add(-15 * time.Minute)
		r := entity.Request{
			Type:           "appointment",
			Detail:         "desc",
			MeetingStart:   &start,
			MeetingEnd:     &end,
			PatientID:      1,
			PsychologistID: 2,
		}
		ok, err := validateRequest(r)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(MatchError(ContainSubstring("meetingEnd must be after meetingStart")))
	})
}
