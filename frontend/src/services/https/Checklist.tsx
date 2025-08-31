// frontend/src/services/https/checklist.ts
import axios from "axios";

// ===== Types =====
export type TaskId =
  | "write_diary"
  | "thought_record"
  | "analyze_diary_daily"
  | "analyze_tr_daily"
  | "exercise"
  | "review_prev_day"
  | "gratitude"
  | "goal_review"
  | "mood_trend_check"
  | "analyze_diary_monthly"
  | "analyze_tr_monthly";

export type TaskItem = { id: TaskId; label: string };

export type ChecklistDTO = {
  id: number;
  patient_id: number;
  date: string;
  timezone: string;
  tasks: TaskItem[];
  done: Record<string, boolean>;
  version: number;
  created_at: string;
  updated_at: string;
};

// ===== Base config =====
// ⚠️ ตั้ง VITE_API_URL ให้ "ตรงกับ route backend จริงๆ"
//   - ถ้า backend ไม่มี prefix /api  => VITE_API_URL=http://localhost:8000
//   - ถ้า backend มี group /api     => VITE_API_URL=http://localhost:8000/api
const RAW_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";

// ตัด slash ท้าย และทำฟังก์ชัน join path ให้ชัวร์
const BASE = RAW_BASE.replace(/\/+$/, "");
const makeUrl = (path: string) => `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;

// NOTE: อ่าน token ทุกครั้ง กัน stale token
const buildRequestOptions = () => {
  const token = localStorage.getItem("token") || "";
  const type = localStorage.getItem("token_type") || "Bearer";
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${type} ${token}`,
    },
  };
};

// ===== Services =====

// GET /patients/:id/checklists?date&tz
async function GetChecklist(
  patientId: number,
  params?: { date?: string; tz?: string }
) {
  const q = new URLSearchParams();
  if (params?.date) q.set("date", params.date); // YYYY-MM-DD
  q.set("tz", params?.tz || "Asia/Bangkok");

  const url = makeUrl(`/patients/${patientId}/checklists?${q.toString()}`);
  return await axios
    .get<ChecklistDTO>(url, buildRequestOptions())
    .then((res) => res)
    .catch((e) => e?.response);
}

// PATCH /patients/:id/checklists/:date/toggle?tz  (body: { taskId, done, version? })
async function ToggleChecklist(
  patientId: number,
  date: string, // YYYY-MM-DD
  payload: { taskId: TaskId | string; done: boolean; version?: number },
  tz = "Asia/Bangkok"
) {
  const q = new URLSearchParams({ tz });
  const url = makeUrl(
    `/patients/${patientId}/checklists/${encodeURIComponent(date)}/toggle?${q.toString()}`
  );
  return await axios
    .patch<ChecklistDTO>(url, payload, buildRequestOptions())
    .then((res) => res)
    .catch((e) => e?.response);
}

// PUT /patients/:id/checklists/:date?tz  (body: { tasks, done, version? })
async function PutChecklist(
  patientId: number,
  date: string,
  payload: { tasks: TaskItem[]; done: Record<string, boolean>; version?: number },
  tz = "Asia/Bangkok"
) {
  const q = new URLSearchParams({ tz });
  const url = makeUrl(
    `/patients/${patientId}/checklists/${encodeURIComponent(date)}?${q.toString()}`
  );
  return await axios
    .put<ChecklistDTO>(url, payload, buildRequestOptions())
    .then((res) => res)
    .catch((e) => e?.response);
}

// GET /patients/:id/checklists/range?from&to&tz
async function GetChecklistRange(
  patientId: number,
  from: string, // YYYY-MM-DD
  to: string,   // YYYY-MM-DD
  tz = "Asia/Bangkok"
) {
  const q = new URLSearchParams({ from, to, tz });
  const url = makeUrl(`/patients/${patientId}/checklists/range?${q.toString()}`);
  return await axios
    .get<ChecklistDTO[]>(url, buildRequestOptions())
    .then((res) => res)
    .catch((e) => e?.response);
}

export { GetChecklist, ToggleChecklist, PutChecklist, GetChecklistRange };
