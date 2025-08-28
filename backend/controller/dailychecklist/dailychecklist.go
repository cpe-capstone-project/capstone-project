package dailychecklist

import (
	"capstone-project/config"
	"capstone-project/entity"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type TaskItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type GetChecklistResponse struct {
	ID        uint              `json:"id"`
	PatientID uint              `json:"patient_id"`
	Date      string            `json:"date"`     // YYYY-MM-DD
	Timezone  string            `json:"timezone"` // e.g. Asia/Bangkok
	Tasks     []TaskItem        `json:"tasks"`
	Done      map[string]bool   `json:"done"`
	Version   uint              `json:"version"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	RawTasks  datatypes.JSONMap `json:"-"`
	RawDone   datatypes.JSONMap `json:"-"`
}

type ToggleChecklistRequest struct {
	TaskID  string `json:"taskId" binding:"required"`
	Done    *bool  `json:"done" binding:"required"`
	Version uint   `json:"version"`
}

type PutChecklistRequest struct {
	Tasks   []TaskItem      `json:"tasks" binding:"required"`
	Done    map[string]bool `json:"done"  binding:"required"`
	Version uint            `json:"version"`
}

// ===== Helpers =====

func parseDateYYYYMMDD(s, tz string) (time.Time, error) {
	if tz == "" {
		tz = "Asia/Bangkok"
	}
	loc, err := time.LoadLocation(tz)
	if err != nil {
		loc = time.FixedZone("ICT", 7*3600)
	}
	t, err := time.ParseInLocation("2006-01-02", s, loc)
	if err != nil {
		return time.Time{}, err
	}
	return time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, loc), nil
}

func weekdayTasks(weekday int) []TaskItem {
	switch weekday {
	case 0: // Sun
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่ (Diary)"},
			{ID: "thought_record", Label: "ทำ Thought Record"},
			{ID: "analyze_diary_daily", Label: "วิเคราะห์ไดอารี่ (รายวัน)"},
			{ID: "analyze_tr_daily", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายวัน)"},
		}
	case 1: // Mon
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำบันทึกความคิด"},
			{ID: "exercise", Label: "ออกกำลังกาย"},
			{ID: "analyze_tr_daily", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายวัน)"},
		}
	case 2: // Tue
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำ Thought Record"},
			{ID: "review_prev_day", Label: "ทบทวนอารมณ์เมื่อวาน"},
			{ID: "analyze_diary_daily", Label: "วิเคราะห์ไดอารี่ (รายวัน)"},
		}
	case 3: // Wed
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำ Thought Record"},
			{ID: "gratitude", Label: "ดู Feedback"},
			{ID: "analyze_tr_daily", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายวัน)"},
		}
	case 4: // Thu
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำบันทึกความคิด"},
			{ID: "goal_review", Label: "ทบทวนเป้าหมายประจำสัปดาห์"},
			{ID: "analyze_diary_daily", Label: "วิเคราะห์ไดอารี่ (รายวัน)"},
		}
	case 5: // Fri
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำบันทึกความคิด"},
			{ID: "mood_trend_check", Label: "ตรวจสอบแนวโน้มอารมณ์"},
			{ID: "analyze_tr_daily", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายวัน)"},
		}
	default: // Sat
		return []TaskItem{
			{ID: "write_diary", Label: "เขียนไดอารี่"},
			{ID: "thought_record", Label: "ทำบันทึกความคิด"},
			{ID: "analyze_diary_daily", Label: "วิเคราะห์ไดอารี่ (รายวัน)"},
			{ID: "analyze_tr_daily", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายวัน)"},
			{ID: "analyze_diary_monthly", Label: "วิเคราะห์ไดอารี่ (รายเดือน)"},
			{ID: "analyze_tr_monthly", Label: "วิเคราะห์อารมณ์จาก Thought Record (รายเดือน)"},
		}
	}
}

func seedChecklist(patientID uint, date time.Time, tz string) *entity.DailyChecklist {
	w := int(date.Weekday())
	tasks := weekdayTasks(w)

	tasksJSON := datatypes.JSONMap{"tasks": tasks}
	doneJSON := datatypes.JSONMap{}
	for _, t := range tasks {
		doneJSON[t.ID] = false
	}

	return &entity.DailyChecklist{
		PatientID: patientID,
		Date:      date,
		Timezone:  tz,
		Tasks:     tasksJSON,
		Done:      doneJSON,
		Version:   1,
	}
}

func toResponse(row *entity.DailyChecklist) GetChecklistResponse {
	var tasks []TaskItem
	if raw, ok := row.Tasks["tasks"]; ok && raw != nil {
		if arr, ok2 := raw.([]any); ok2 {
			for _, it := range arr {
				if m, ok3 := it.(map[string]any); ok3 {
					id, _ := m["id"].(string)
					label, _ := m["label"].(string)
					tasks = append(tasks, TaskItem{ID: id, Label: label})
				}
			}
		}
	}
	done := map[string]bool{}
	for k, v := range row.Done {
		if b, ok := v.(bool); ok {
			done[k] = b
		}
	}
	return GetChecklistResponse{
		ID:        row.ID,
		PatientID: row.PatientID,
		Date:      row.Date.Format("2006-01-02"),
		Timezone:  row.Timezone,
		Tasks:     tasks,
		Done:      done,
		Version:   row.Version,
		CreatedAt: row.CreatedAt,
		UpdatedAt: row.UpdatedAt,
		RawTasks:  row.Tasks,
		RawDone:   row.Done,
	}
}

// ===== Handlers =====

func GetChecklist(c *gin.Context) {
	gdb := config.DB() // ✅ CALL the function
	if gdb == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db not initialized"})
		return
	}

	var patientID uint
	if err := parseUintParam(c.Param("id"), &patientID); err != nil || patientID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	tz := c.DefaultQuery("tz", "Asia/Bangkok")
	day := c.Query("date")
	if day == "" {
		now := time.Now()
		loc, _ := time.LoadLocation(tz)
		if loc == nil {
			loc = time.FixedZone("ICT", 7*3600)
		}
		now = now.In(loc)
		day = now.Format("2006-01-02")
	}

	date, err := parseDateYYYYMMDD(day, tz)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date"})
		return
	}

	var row entity.DailyChecklist
	err = gdb.Where("patient_id = ? AND date = ?", patientID, date).First(&row).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			newRow := seedChecklist(patientID, date, tz)
			if e := gdb.Create(newRow).Error; e != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": e.Error()})
				return
			}
			c.JSON(http.StatusOK, toResponse(newRow))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, toResponse(&row))
}

func ToggleChecklist(c *gin.Context) {
	gdb := config.DB() // ✅
	if gdb == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db not initialized"})
		return
	}

	var patientID uint
	if err := parseUintParam(c.Param("id"), &patientID); err != nil || patientID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	tz := c.DefaultQuery("tz", "Asia/Bangkok")
	day := c.Param("date")
	if day == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date path param required (YYYY-MM-DD)"})
		return
	}
	date, err := parseDateYYYYMMDD(day, tz)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date"})
		return
	}

	var req ToggleChecklistRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.TaskID == "" || req.Done == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	var row entity.DailyChecklist
	if err := gdb.Where("patient_id = ? AND date = ?", patientID, date).First(&row).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			newRow := seedChecklist(patientID, date, tz)
			if e := gdb.Create(newRow).Error; e != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": e.Error()})
				return
			}
			row = *newRow
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// optimistic lock
	if req.Version != 0 && req.Version != row.Version {
		c.JSON(http.StatusConflict, gin.H{
			"error":          "version_conflict",
			"server_version": row.Version,
		})
		return
	}

	// update
	if row.Done == nil {
		row.Done = datatypes.JSONMap{}
	}
	row.Done[req.TaskID] = *req.Done
	row.Version++

	if err := gdb.Model(&row).Select("Done", "Version").Updates(row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var saved entity.DailyChecklist
	_ = gdb.Where("id = ?", row.ID).First(&saved).Error
	c.JSON(http.StatusOK, toResponse(&saved))
}

func PutChecklist(c *gin.Context) {
	gdb := config.DB() // ✅
	if gdb == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db not initialized"})
		return
	}

	var patientID uint
	if err := parseUintParam(c.Param("id"), &patientID); err != nil || patientID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	tz := c.DefaultQuery("tz", "Asia/Bangkok")
	day := c.Param("date")
	if day == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date path param required"})
		return
	}
	date, err := parseDateYYYYMMDD(day, tz)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date"})
		return
	}

	var req PutChecklistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	tasksJSON := datatypes.JSONMap{"tasks": req.Tasks}
	doneJSON := datatypes.JSONMap{}
	for k, v := range req.Done {
		doneJSON[k] = v
	}

	var row entity.DailyChecklist
	err = gdb.Where("patient_id = ? AND date = ?", patientID, date).First(&row).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			row = entity.DailyChecklist{
				PatientID: patientID,
				Date:      date,
				Timezone:  tz,
				Tasks:     tasksJSON,
				Done:      doneJSON,
				Version:   1,
			}
			if e := gdb.Create(&row).Error; e != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": e.Error()})
				return
			}
			c.JSON(http.StatusOK, toResponse(&row))
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// optimistic lock
	if req.Version != 0 && req.Version != row.Version {
		c.JSON(http.StatusConflict, gin.H{
			"error":          "version_conflict",
			"server_version": row.Version,
		})
		return
	}

	row.Tasks = tasksJSON
	row.Done = doneJSON
	row.Version++

	if err := gdb.Model(&row).Select("Tasks", "Done", "Version").Updates(row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var saved entity.DailyChecklist
	_ = gdb.Where("id = ?", row.ID).First(&saved).Error
	c.JSON(http.StatusOK, toResponse(&saved))
}

func GetChecklistRange(c *gin.Context) {
	gdb := config.DB() // ✅
	if gdb == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db not initialized"})
		return
	}

	var patientID uint
	if err := parseUintParam(c.Param("id"), &patientID); err != nil || patientID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	tz := c.DefaultQuery("tz", "Asia/Bangkok")
	fromStr := c.Query("from")
	toStr := c.Query("to")
	if fromStr == "" || toStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "from and to are required"})
		return
	}
	from, err := parseDateYYYYMMDD(fromStr, tz)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid from"})
		return
	}
	to, err := parseDateYYYYMMDD(toStr, tz)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid to"})
		return
	}

	var rows []entity.DailyChecklist
	if err := gdb.Where("patient_id = ? AND date BETWEEN ? AND ?", patientID, from, to).
		Order("date asc").
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resp := make([]GetChecklistResponse, 0, len(rows))
	for i := range rows {
		resp = append(resp, toResponse(&rows[i]))
	}
	c.JSON(http.StatusOK, resp)
}

// small util
func parseUintParam(s string, out *uint) error {
	var id64 uint64
	_, err := fmt.Sscanf(s, "%d", &id64)
	if err != nil {
		return err
	}
	*out = uint(id64)
	return nil
}
