package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"capstone-project/entity"
)

func TestDiariesValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	// ✅ Case 1: Valid input
	t.Run("should pass validation for valid diary", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "My First Diary",
			Content:      "Today was a good day",
			UpdatedAt:    time.Now(),
			Confirmed:    true, // optional
			TagColor1:    "#FF0000",
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	// ❌ Case 2: Title is empty
	t.Run("should fail when Title is empty", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "",
			Content:      "No title",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 1,
			TagColor1:    "#FF0000",
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("Title is required"))
	})

	// ❌ Case 3: Content is empty
	t.Run("should fail when Content is empty", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "Missing content",
			Content:      "",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 1,
			TagColor1:    "#FF0000",
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("Content is required"))
	})

	// ❌ Case 4: UpdatedAt missing (zero time)
	t.Run("should fail when UpdatedAt is missing", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "No UpdatedAt",
			Content:      "Missing updated time",
			UpdatedAt:    time.Time{}, // zero value
			TherapyCaseID: 1,
			TagColor1:    "#FF0000",
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("UpdatedAt is required"))
	})

	// ❌ Case 5.1: Invalid TagColor1 (not hex)
	t.Run("should fail when TagColor1 is not a hex color", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "Bad Color",
			Content:      "Color format invalid",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 1,
			TagColor1:    "red", 		// invalid hex
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("TagColor1 must be a valid hex color"))
	})

	// ❌ Case 5.2: Invalid TagColor2 (not hex)
	t.Run("should fail when TagColor1 is not a hex color", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "Bad Color",
			Content:      "Color format invalid",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 1,
			TagColor1:    "#FF0000", 	// invalid hex
			TagColor2:    "green",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("TagColor2 must be a valid hex color"))
	})

	// ❌ Case 5.3: Invalid TagColor3 (not hex)
	t.Run("should fail when TagColor1 is not a hex color", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "Bad Color",
			Content:      "Color format invalid",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 1,
			TagColor1:    "#FF0000", 
			TagColor2:    "#00FF00",
			TagColor3:    "blue",		// invalid hex
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("TagColor3 must be a valid hex color"))
	})

	// ❌ Case 6: TherapyCaseID missing
	t.Run("should fail when TherapyCaseID is zero", func(t *testing.T) {
		diary := entity.Diaries{
			Title:        "No TherapyCase",
			Content:      "TherapyCaseID missing",
			UpdatedAt:    time.Now(),
			TherapyCaseID: 0, // required
			TagColor1:    "#FF0000",
			TagColor2:    "#00FF00",
			TagColor3:    "#0000FF",
		}

		ok, err := govalidator.ValidateStruct(diary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("TherapyCaseID is required"))
	})
}
