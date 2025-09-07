package unit

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
	"capstone-project/entity"
)

func TestDiarySummaryValidation(t *testing.T) {
	g := NewGomegaWithT(t)

	// ✅ Case 1: Valid input
	t.Run("should pass validation for valid DiarySummary", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Now(),
			SummaryText:   "This week was productive",
			Keyword:       "Productivity",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeTrue())
		g.Expect(err).To(BeNil())
	})

	// ❌ Case 2: Missing Timeframe
	t.Run("should fail when Timeframe is empty", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Now(),
			SummaryText:   "Some text",
			Keyword:       "Keyword",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("Timeframe is required"))
	})

	// ❌ Case 3: Missing StartDate
	t.Run("should fail when StartDate is missing", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Time{}, // zero
			EndDate:       time.Now(),
			SummaryText:   "Some text",
			Keyword:       "Keyword",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("StartDate is required"))
	})

	// ❌ Case 4: Missing EndDate
	t.Run("should fail when EndDate is missing", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Time{}, // zero
			SummaryText:   "Some text",
			Keyword:       "Keyword",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("EndDate is required"))
	})

	// ❌ Case 5: Missing SummaryText
	t.Run("should fail when SummaryText is empty", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Now(),
			SummaryText:   "",
			Keyword:       "Keyword",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("SummaryText is required"))
	})

	// ❌ Case 6: Missing Keyword
	t.Run("should fail when Keyword is empty", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Now(),
			SummaryText:   "Some text",
			Keyword:       "",
			TherapyCaseID: 1,
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("Keyword is required"))
	})

	// ❌ Case 7: Missing TherapyCaseID
	t.Run("should fail when TherapyCaseID is zero", func(t *testing.T) {
		summary := entity.DiarySummary{
			Timeframe:     "Weekly",
			StartDate:     time.Now().AddDate(0, 0, -7),
			EndDate:       time.Now(),
			SummaryText:   "Some text",
			Keyword:       "Keyword",
			TherapyCaseID: 0, // invalid
		}

		ok, err := govalidator.ValidateStruct(summary)
		g.Expect(ok).To(BeFalse())
		g.Expect(err).To(HaveOccurred())
		g.Expect(err.Error()).To(ContainSubstring("TherapyCaseID is required"))
	})
}
