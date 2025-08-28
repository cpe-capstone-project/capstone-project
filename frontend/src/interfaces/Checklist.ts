// interfaces/checklist.ts
export type TaskId =
  | "write_diary" | "thought_record" | "analyze_diary_daily" | "analyze_tr_daily"
  | "exercise" | "review_prev_day" | "gratitude" | "goal_review"
  | "mood_trend_check" | "analyze_diary_monthly" | "analyze_tr_monthly";

export type TaskItem = { id: TaskId; label: string };

export type ChecklistDTO = {
  id: number;
  patient_id: number;
  date: string;              // "YYYY-MM-DD"
  timezone: string;
  tasks: TaskItem[];
  done: Record<string, boolean>;
  version: number;
  created_at: string;
  updated_at: string;
};
