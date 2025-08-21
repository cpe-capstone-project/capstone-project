
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./tailwind.css";
//import DiarySummary from "../diary_summary/DiarySummary";
import { GetDiaryCountThisMonth, GetHomeDiaries } from "../../services/https/Diary";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import type { DiaryInterface } from "../../interfaces/IDiary";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";
//import pamemo1 from "../assets/pamemo1.png"; // ปรับ path ให้ถูกต้องตามโปรเจกต์คุณ
import { k, KEYS } from "../../unid/storageKeys";
import DiaryStatsChart from "../../components/DiaryStatsChart/DiaryStatsChart";
import { useDiary } from "../../contexts/DiaryContext";
import { useDiarySummary, TAGS } from "../../hooks/useDiarySummary";
import { useMemo } from "react";
import { GetDiarySummaryById } from "../../services/https/Diary"; // ⬅️ เพิ

function HomePage() {
  // ใส่ไว้ในฟังก์ชัน HomePage() ด้านบน ๆ ใกล้ ๆ state อื่น ๆ
const { diaries } = useDiary();
  const [summaryKeywords, setSummaryKeywords] = useState<string[]>([]); // ⬅️ เพิ่ม
  const [today, setToday] = useState<DiaryInterface | null>(null);
  const [week, setWeek] = useState<DiaryInterface | null>(null);
  const [loading, setLoading] = useState(true);
// แปลงแท็บ -> label ภาษาไทยที่ backend ใช้
/*const tabToLabelTH = (tab: "daily" | "weekly" | "monthly"): "รายวัน" | "รายสัปดาห์" | "รายเดือน" => {
  if (tab === "weekly") return "รายสัปดาห์";
  if (tab === "monthly") return "รายเดือน";
  return "รายวัน";
};*/
// ด้านล่าง useEffect อื่น ๆ ใน HomePage
useEffect(() => {
  (async () => {
    try {
      const idRaw = localStorage.getItem("diary_summary_id");
      const id = idRaw ? parseInt(idRaw) : 0;
      if (!id) return;

      const res = await GetDiarySummaryById(id);
      if (res?.status === 200 && res.data) {
        // สมมติ backend ส่ง field "Keyword" เป็นสตริง เช่น "stress, anxious, sleep"
        const raw = String(res.data.Keyword ?? "");
        const tokens = raw
          .split(/[,\n]/)         // คั่นด้วย , หรือขึ้นบรรทัด
          .map((s) => s.trim())
          .filter(Boolean);
        setSummaryKeywords(tokens);
      }
    } catch {
      setSummaryKeywords([]);
    }
  })();
}, []);

const [summarizedTabs, setSummarizedTabs] = useState<{
  daily?: boolean;
  weekly?: boolean;
  monthly?: boolean;
}>({});
const onTab = async (tab: "daily" | "weekly" | "monthly") => {
  setStatTab(tab);
  if (!summarizedTabs[tab] && !isSummarizingStats) {
    try {
      await summarize(tab);
      setSummarizedTabs((prev) => ({ ...prev, [tab]: true }));
    } catch (e) {
      // optional: แจ้ง error หรือ Swal.alert ก็ได้
      console.error(e);
    }
  }
};

const norm = (s: string) => s.trim().toLowerCase();
const toClass = (t: string) => norm(t).replace(/\s+/g, "-");
const EMOJI: Record<string, string> = {
  happy: "😊", sad: "😢", anxious: "😰", calm: "😐",
  angry: "😠", excited: "🤩", tired: "🥱", confused: "🤔",
  grateful: "💖", neutral: "😐",
};
 const [statTab, setStatTab] = useState<"daily" | "weekly" | "monthly">("daily");
 const {
  isLoading: isSummarizingStats,
   summaryText,
   detectedEmotions,
   currentEmotion,
   summarize,
 } = useDiarySummary();
// ✅ รวมคีย์เวิร์ดที่จะไฮไลต์ (อาจเพิ่มคำอื่น ๆ ได้เอง)
const HIGHLIGHT_WORDS = useMemo(() => {
  const arr = [
    ...TAGS,
    ...(detectedEmotions || []),
    ...(currentEmotion ? [currentEmotion] : []),
     ...summaryKeywords,
  ];
 return Array.from(new Set(arr.map((t) => t.trim()).filter(Boolean)));
}, [detectedEmotions, currentEmotion, summaryKeywords]);  


const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const highlightText = (text?: string | null) => {
  if (!text || !HIGHLIGHT_WORDS.length) return text || "— ยังไม่มีสรุป —";
  const pattern = new RegExp(`(${HIGHLIGHT_WORDS.map(escapeReg).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="aertr-highlight">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

// สร้างช่วงเวลา (local time)
/*const getRangeForTab = (tab: "daily" | "weekly" | "monthly") => {
  const now = new Date();
  let start = new Date(), end = new Date();
  if (tab === "daily") {
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
  } else if (tab === "weekly") {
    const offset = now.getDay() === 0 ? -6 : 1 - now.getDay(); // จันทร์เป็นวันแรก
    start = new Date(now);
    start.setDate(now.getDate() + offset);
    start.setHours(0,0,0,0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23,59,59,999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
    end = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
  }
  return { start, end };
};*/


  useEffect(() => {
    (async () => {
      try {
        const res = await GetHomeDiaries("Asia/Bangkok");
        // ใหม่
if (res?.status === 200) {
  setToday(res.data.today ?? null);
  setWeek(res.data.week ?? null);
}
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const relTime = (iso?: string) =>
    iso ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: th }) : "";
// ---- Task types ----
type TaskId =
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

type Task = { id: TaskId; label: string };

type ChecklistState = {
  date: string;                     // YYYY-MM-DD
  tasks: Task[];                    // รายการงานของวันนั้น
  done: Record<TaskId, boolean>;    // สถานะของแต่ละงาน
};

// ---- 7 วัน: เซ็ตงานไม่ซ้ำกัน ----
const TASK_SETS: Task[][] = [
  // Day 1
  [
    { id: "write_diary", label: "เขียนไดอารี่(Diary)" },
    { id: "thought_record", label: "ทำ Though Record" },
    { id: "analyze_diary_daily", label: "วิเคราะห์ผล Diary(รายวัน)" },
    { id: "analyze_tr_daily", label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)" },
  ],
  // Day 2
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำบันทึกความคิด" },
    { id: "exercise", label: "ทำ Though Record" },
    { id: "analyze_tr_daily", label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)" },
  ],
  // Day 3
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำ Though Record" },
    { id: "review_prev_day", label: "ทบทวนอารมณ์เมื่อวาน" },
    { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
  ],
  // Day 4
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำ Though Record" },
    { id: "gratitude", label: "ดู Feedback" },
    { id: "analyze_tr_daily", label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)" },
  ],
  // Day 5
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำบันทึกความคิด" },
    { id: "goal_review", label: "ทบทวนเป้าหมายประจำสัปดาห์" },
    { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
  ],
  // Day 6
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำบันทึกความคิด" },
    { id: "mood_trend_check", label: "ตรวจสอบแนวโน้มอารมณ์" },
    { id: "analyze_tr_daily", label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)" },
  ],
  // Day 7 (เพิ่มสรุปรายเดือน)
  [
    { id: "write_diary", label: "เขียนไดอารี่" },
    { id: "thought_record", label: "ทำบันทึกความคิด" },
    { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
    { id: "analyze_tr_daily", label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)" },
    { id: "analyze_diary_monthly", label: "วิเคราะห์ไดอารี่ (รายเดือน)" },
    { id: "analyze_tr_monthly", label: "วิเคราะห์อารมณ์จาก Though Record (รายเดือน)" },
  ],
];
const NOTI_KEY = k(KEYS.NOTI);
const NOTICE_FLAG_KEY = k(KEYS.NOTICE_FLAG);


// ---- utils ----
const STORAGE_KEY = k(KEYS.CHECK_DAY);
const STORAGE_KEY_BYDATE = k(KEYS.CHECK_BYDATE);
//const STORAGE_KEY = "daily-checklist-v2"; // เปลี่ยน key กันชนกับของเก่า
const todayKey = () => new Date().toISOString().slice(0, 10);
const dayIndex = (d = new Date()) => d.getDay(); // 0=Sun ... 6=Sat
const FORCE_DAY_INDEX: number | null = null;  // 0=Day1, 1=Day2,...; ใส่ null ถ้าอยาก auto ตามวันอาทิตย์ถึงเสาร์
const tasksForToday = () => TASK_SETS[(FORCE_DAY_INDEX ?? dayIndex())];
const ICON_UNCHECKED = "https://cdn-icons-png.flaticon.com/128/2217/2217292.png";
const ICON_CHECKED   = "https://cdn-icons-png.flaticon.com/128/2951/2951459.png";

const emptyDoneMap = (tasks: Task[]): Record<TaskId, boolean> =>
  tasks.reduce((acc, t) => ((acc[t.id] = false), acc), {} as Record<TaskId, boolean>);
 const [monthCount, setMonthCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    GetDiaryCountThisMonth()
      .then((res) => {
        if (isMounted && res?.status === 200) {
          setMonthCount(res.data.count ?? 0);
        }
      })
      .catch(() => {
        if (isMounted) setMonthCount(0);
      });
    return () => { isMounted = false; };
  }, []);
const newDayState = (): ChecklistState => {
  const tasks = tasksForToday();
  return {
    date: todayKey(),
    tasks,
    done: emptyDoneMap(tasks),
  };
};
// === per-date storage สำหรับ modal ===
//const STORAGE_KEY_BYDATE = "daily-checklist-bydate-v2";
const dateKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// เอาเซ็ตงานของ "วันที่นั้น" (อิง day-of-week จริง ไม่ใช่ FORCE_DAY_INDEX)
function getTasksForDate(d: Date): Task[] {
  return TASK_SETS[d.getDay()];
}

type ChecklistStateByDate = {
  date: string;                 // YYYY-MM-DD
  tasks: Task[];
  done: Record<TaskId, boolean>;
};

function loadStore(): Record<string, ChecklistStateByDate> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BYDATE) || "{}");
  } catch {
    return {};
  }
}
function saveStore(store: Record<string, ChecklistStateByDate>) {
  localStorage.setItem(STORAGE_KEY_BYDATE, JSON.stringify(store));
}

function loadDay(d: Date): ChecklistStateByDate {
  const key = dateKey(d);
  const store = loadStore();
  const existed = store[key];
  const todayTasks = getTasksForDate(d);

  if (!existed) {
    const fresh: ChecklistStateByDate = {
      date: key,
      tasks: todayTasks,
      done: emptyDoneMap(todayTasks),
    };
    store[key] = fresh;
    saveStore(store);
    return fresh;
  }

  // ถ้าเซ็ตงานเปลี่ยน (เช่นต่างวัน/ต่างดัชนี) → rebuild แต่พยายามคงสถานะ id เดิม
  const same =
    existed.tasks.length === todayTasks.length &&
    existed.tasks.every((t, i) => t.id === todayTasks[i].id);

  if (!same) {
    const rebuilt: ChecklistStateByDate = {
      date: key,
      tasks: todayTasks,
      done: (() => {
        const next = emptyDoneMap(todayTasks);
        Object.keys(next).forEach((id) => {
          if (existed.done[id as TaskId] !== undefined) {
            next[id as TaskId] = existed.done[id as TaskId];
          }
        });
        return next;
      })(),
    };
    store[key] = rebuilt;
    saveStore(store);
    return rebuilt;
  }

  return existed;
}

function saveDay(state: ChecklistStateByDate) {
  const store = loadStore();
  store[state.date] = state;
  saveStore(store);
}

function loadChecklist(): ChecklistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return newDayState();
    const parsed: ChecklistState = JSON.parse(raw);

    // ถ้าวันเปลี่ยน หรือเซ็ตงานของวันนี้ต่างจากที่เก็บไว้ → รีบิวด์ใหม่
    const today = todayKey();
    const todayTasks = tasksForToday();
    const sameDate = parsed.date === today;
    const sameTaskSet =
      parsed.tasks.length === todayTasks.length &&
      parsed.tasks.every((t, i) => t.id === todayTasks[i].id);

    if (!sameDate || !sameTaskSet) return newDayState();
    return parsed;
  } catch {
    return newDayState();
  }
}

function saveChecklist(s: ChecklistState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// ตั้ง reset ที่เที่ยงคืน (เวลาท้องถิ่น)
function scheduleMidnightReset(cb: () => void) {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  const ms = midnight.getTime() - now.getTime();
  const t = setTimeout(() => {
    cb();
    scheduleMidnightReset(cb);
  }, ms);
  return () => clearTimeout(t);
}

// ---- state & effects ----
const [checklist, setChecklist] = useState<ChecklistState>(() => loadChecklist());

useEffect(() => { saveChecklist(checklist); }, [checklist]);

useEffect(() => scheduleMidnightReset(() => setChecklist(newDayState())), []);

// ---- actions ----
const toggleTask = (id: TaskId) =>
  setChecklist((s) => ({
    ...s,
    done: { ...s.done, [id]: !s.done[id] },
  }));

// ---- progress ----
const total = checklist.tasks.length;
const completed = Object.values(checklist.done).filter(Boolean).length;
const progressPct = total ? (completed / total) * 100 : 0;


  const navigate = useNavigate();
  // const [latestDiaries, setLatestDiaries] = useState<DiaryInterface[]>([]);
  useEffect(() => {
    //showSuccessLog(); // <--- เพิ่มเพื่อทดสอบ
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true" || role !== "Patient") {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
      }).then(() => {
        navigate("/");
      });
    }
  }, [navigate]);
  //const [loginCount, setLoginCount] = useState(0);
  //const [percentChange, setPercentChange] = useState(0);

  //useEffect(() => {
   // const email = localStorage.getItem("currentLoginUser") || "";
    //const loginHistoryKey = loginHistory-${email};
    //const loginHistory = JSON.parse(
    //  localStorage.getItem(loginHistoryKey) || "{}"
   // );

    //const today = new Date();
    //const todayStr = today.toLocaleDateString("th-TH");

    //const yesterday = new Date(today);
   // yesterday.setDate(today.getDate() - 1);
    //const yesterdayStr = yesterday.toLocaleDateString("th-TH");

    //const todayCount = loginHistory[todayStr] || 0;
   // const yesterdayCount = loginHistory[yesterdayStr] || 0;

    //const percent =
      //yesterdayCount > 0
       // ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
        //: todayCount > 0
       // ? 100 // ถ้าวันนี้มี แต่เมื่อวานไม่มีเลย → ถือเป็น +100%
       // : 0; // ถ้าวันนี้ก็ไม่มี → แสดง 0%

    //setLoginCount(todayCount);
    //setPercentChange(percent);
  //}, []);
const updateNoticeStatus = (
  appointmentId: string | number,
  status: "accepted" | "rejected"
): boolean => {
  let list: any[] = [];
  try {
    const raw = localStorage.getItem(NOTI_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    list = Array.isArray(parsed) ? parsed : [];
  } catch {
    list = [];
  }

  const idx = list.findIndex(
    (x) => String(x.appointment_id) === String(appointmentId)
  );
  if (idx === -1) return false;

  if (list[idx].status !== status) {
    list[idx] = { ...list[idx], status, _updatedAt: new Date().toISOString() };
    localStorage.setItem(NOTI_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("calendarEventsUpdated"));
    window.dispatchEvent(new Event("storage"));
  }
  return true;
};
useEffect(() => {
(window as any).confirmAppointment = async (
  appointmentId: string | number,
  status: "accepted" | "rejected"
) => {
  try {
    const res = await fetch("http://localhost:8000/appointments/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id: Number(appointmentId), status }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      // 401 ก็เด้งล็อกอินได้เลย
      if (res.status === 401) {
        Swal.fire("หมดเวลาเข้าสู่ระบบ", "โปรดเข้าสู่ระบบอีกครั้ง", "warning");
        // เคลียร์ token แล้วนำทางกลับหน้าล็อกอินตามที่คุณใช้อยู่
      } else {
        Swal.fire("อัปเดตไม่สำเร็จ", msg || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", "error");
      }
      return; // ⛔️ อย่าไปอัพเดต local ต่อ
    }
    try {
  const bc = new BroadcastChannel("appointment_updates");
  bc.postMessage({
    type: "appointment_status_changed",
    appointment_id: Number(appointmentId),
    status, // "accepted" | "rejected"
  });
  bc.close();
} catch {}
    updateNoticeStatus(appointmentId, status);

    Swal.fire({
      icon: "success",
      title: status === "accepted" ? "ยืนยันนัดแล้ว" : "ปฏิเสธนัดแล้ว",
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (e) {
    console.error("Update appointment status failed:", e);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
  }
};


  return () => {
    try { delete (window as any).confirmAppointment; } catch {}
  };
}, []);



useEffect(() => {
  const wsUid =
    localStorage.getItem("ws_uid") ||
    `p:${localStorage.getItem("patient_id") || localStorage.getItem("id") || ""}`;

  if (!wsUid) return;

  const socket = new WebSocket(`ws://localhost:8000/ws/${encodeURIComponent(wsUid)}`);
  socket.onopen = () => console.log("✅ WS patient connected:", wsUid);
  socket.onerror = (err) => console.error("❌ WebSocket error", err);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data || "{}");

    // === นัดหมายใหม่ที่หมอสร้าง ===
    if (data.type === "appointment_created") {
      const existing = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
      const updated = [
        ...existing,
        {
          start_time: data.start_time,
          end_time: data.end_time,
          detail: data.detail,
          appointment_id: data.appointment_id,
          status: (data.status || "pending") as "pending" | "accepted" | "rejected",
          rescheduled: false, 
        },
      ];
      localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
      localStorage.setItem(NOTICE_FLAG_KEY, "true");

      const htmlContent = `
        <div style="background-color:#e0f2ff;padding:20px;border-radius:16px;text-align:left;">
          <h3 style="margin-bottom:15px;text-align:center;">
            <img src="https://cdn-icons-png.flaticon.com/128/10215/10215675.png" width="32" style="vertical-align:middle;margin-right:8px;" />
            แจ้งเตือนนัดหมาย
          </h3>
          <div style="background:#fff;padding:10px 16px;border-radius:12px;margin-bottom:10px;font-size:0.9rem;">
            <div><b>ปรึกษาแพทย์</b> เวลานัด: ${new Date(data.start_time).toLocaleDateString()}
              ${new Date(data.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${new Date(data.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} น.
            </div>
            <div><b>รายละเอียด:</b> ${data.detail ?? "—"}</div>
          </div>
        </div>
      `;

      Swal.fire({
        html: htmlContent,
        width: 600,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "✅ ยืนยันการนัด",
        denyButtonText: "❌ ปฏิเสธการนัด",
        cancelButtonText: "ยกเลิก",
        showCloseButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.confirmAppointment?.(data.appointment_id, "accepted");
          updateNoticeStatus(data.appointment_id, "accepted");
        } else if (result.isDenied) {
          window.confirmAppointment?.(data.appointment_id, "rejected");
          updateNoticeStatus(data.appointment_id, "rejected");
        }
      });

      return;
    }

    // === หมออัปเดตสถานะ (echo กลับผู้ป่วย) ===
    if (data.type === "appointment_status_echo") {
      updateNoticeStatus(data.appointment_id, data.status);
      return;
    }
if (data.type === "appointment_time_updated") {
  try {
    const id = data.appointment_id;
    const list: any[] = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
    const idx = list.findIndex((x) => String(x.appointment_id) === String(id));
    if (idx !== -1) {
      const oldStart = list[idx].start_time;
      const oldEnd = list[idx].end_time;

      // ⬇️ เก็บเวลาเดิม + ติดธงว่าเคยเลื่อน + อัปเดตเวลาใหม่
      list[idx] = {
        ...list[idx],
        old_start_time: oldStart,
        old_end_time: oldEnd,
        start_time: data.new_start,
        end_time: data.new_end,
        rescheduled: true,
        _updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(NOTI_KEY, JSON.stringify(list));
      // กระตุ้นให้การ์ด/ลิสต์คำนวณใหม่
      window.dispatchEvent(new Event("calendarEventsUpdated"));
      window.dispatchEvent(new Event("storage"));

      // ⬇️ แจ้งเตือน (สีส้ม)
      const fmtDate = (d: Date) =>
        d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
      const fmtTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const os = new Date(oldStart);
      const oe = new Date(oldEnd);
      const ns = new Date(data.new_start);
      const ne = new Date(data.new_end);

      const html = `
        <div style="background:#fff7ed;border:1px solid #fed7aa;padding:16px;border-radius:12px;text-align:left">
          <h3 style="margin:0 0 8px;color:#9a3412">⏱️ เลื่อนเวลานัดหมาย</h3>
          <div style="margin:6px 0">
            <div><b>จากเดิม:</b> <span style="color:#6b7280"><s>${fmtDate(os)} ${fmtTime(os)}–${fmtTime(oe)} น.</s></span></div>
            <div><b>เป็นเวลาใหม่:</b> <span style="color:#d97706;font-weight:700">${fmtDate(ns)} ${fmtTime(ns)}–${fmtTime(ne)} น.</span></div>
          </div>
          ${
            list[idx].detail
              ? `<div style="margin-top:6px"><b>รายละเอียด:</b> ${list[idx].detail}</div>`
              : ""
          }
        </div>
      `;

      Swal.fire({
        html,
        width: 600,
        icon: undefined,
        showConfirmButton: true,
        confirmButtonText: "รับทราบ",
      });
    }
  } catch (e) {
    console.error("update local time failed:", e);
  }
  return;
}

  };

  return () => socket.close();
}, []);

 // ==== Appointments (patient side) ====
type Notice = {
  start_time: string;
  end_time: string;
  detail?: string;
  status?: "pending" | "accepted" | "rejected";
  appointment_id?: string | number;

  old_start_time?: string;
  old_end_time?: string;
  rescheduled?: boolean;
};

const [upcomingNotices, setUpcomingNotices] = useState<Notice[]>([]);

const fmtDateShortTH = (d: Date) =>
  d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }); // เช่น 15 ธ.ค.
const fmtTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
useEffect(() => {
  const computeUpcoming = () => {
    const raw = localStorage.getItem(NOTI_KEY);
    const items: Notice[] = raw ? JSON.parse(raw) : [];
    const now = new Date();

    const upcoming = items
      .map((it) => ({
        ...it,
        _start: new Date(it.start_time),
        _end: new Date(it.end_time),
      }))
      // ✅ โชว์เฉพาะนัดที่ "ยืนยันแล้ว" + อยู่ในอนาคต
      .filter((it) => it.status === "accepted" && it._start > now)
      .sort((a, b) => a._start.getTime() - b._start.getTime())
      .slice(0, 5)
      .map(({ _start, _end, ...rest }) => rest as Notice);

    setUpcomingNotices(upcoming);
  };

  computeUpcoming();
  const onUpdate = () => computeUpcoming();
  window.addEventListener("calendarEventsUpdated", onUpdate);
  window.addEventListener("storage", onUpdate);
  return () => {
    window.removeEventListener("calendarEventsUpdated", onUpdate);
    window.removeEventListener("storage", onUpdate);
  };
}, []);


// --- state ---
const [daysAway, setDaysAway] = useState<number | null>(null); // ตัวเลขใหญ่ (จำนวนคิววันนี้/พรุ่งนี้ หรือจำนวนวันห่าง)
const [daysDiff, setDaysDiff] = useState<number | null>(null); // วันห่างจริง (0/1/2/...)
const [nextAppointmentText, setNextAppointmentText] = useState("ไม่มีนัดหมายเร็ว ๆ นี้");

// --- effect ---
useEffect(() => {
  const computeNext = () => {
    const allNotices: Notice[] = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
    const now = new Date();

    const upcoming = allNotices
      .map((item) => ({
        ...item,
        start: new Date(item.start_time),
        end: new Date(item.end_time),
      }))
      .filter((item) => item.status === "accepted" && item.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (upcoming.length > 0) {
      const next = upcoming[0];

      // วันเดียวกันไหม
      const isSameDate = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      // นัดทั้งหมดที่อยู่วันเดียวกับนัดถัดไป
      const sameDayCount = upcoming.filter((it) => isSameDate(it.start, next.start)).length;

      // วันห่างจริง
      const diff = Math.max(
        0,
        Math.ceil((next.start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      setDaysDiff(diff); // ใช้ตัวนี้ตัดสิน subtext Today/Tomorrow
      setDaysAway(diff === 0 || diff === 1 ? sameDayCount : diff); // เลขใหญ่: วันนี้/พรุ่งนี้แสดงเป็นจำนวนคิว, อื่นๆแสดงเป็นจำนวนวัน

      const startDate = next.start.toLocaleDateString("th-TH");
      const startTime = next.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const endTime = next.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      // ✅ แก้ template literal ให้ถูก
      setNextAppointmentText(`${startDate} ${startTime}–${endTime} น.`);
    } else {
      setDaysDiff(null);
      setDaysAway(null);
      setNextAppointmentText("ไม่มีนัดหมายเร็ว ๆ นี้");
    }
  };

  computeNext();
  const onNoticeUpdate = () => computeNext();
  window.addEventListener("storage", onNoticeUpdate);
  window.addEventListener("calendarEventsUpdated", onNoticeUpdate);
  return () => {
    window.removeEventListener("storage", onNoticeUpdate);
    window.removeEventListener("calendarEventsUpdated", onNoticeUpdate);
  };
}, []);



const handleShowAppointmentsAll = () => {
  const raw = localStorage.getItem(NOTI_KEY) || "[]";
  const data = JSON.parse(raw);

  // แปลงเวลาขึ้นมาใช้งาน + จัดกลุ่ม
  const now = new Date();
 // ใหม่ (เอาทุกสถานะมาด้วย: pending / accepted / rejected)
const list = data
  .map((item: any) => ({
    ...item,
    _start: new Date(item.start_time),
    _end: new Date(item.end_time),
  }))
  .sort((a: any, b: any) => a._start.getTime() - b._start.getTime());


  const upcoming = list.filter((x: any) => x._start >= now);
  const past = list.filter((x: any) => x._start < now).reverse(); // ล่าสุดอยู่บน

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("th-TH", { day: "2-digit", month: "short", year: "numeric" });
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  /*const badge = (status?: string) => {
    if (status === "accepted") return `<span style="color:#10b981;font-weight:600">✅ ยืนยันแล้ว</span>`;
    if (status === "rejected") return `<span style="color:#ef4444;font-weight:600">❌ ปฏิเสธแล้ว</span>`;
    return `<span style="color:#f59e0b;font-weight:600">⌛ รอดำเนินการ</span>`;
  };*/
  const renderItem = (x: any) => {
  const _start = new Date(x.start_time);
  const _end = new Date(x.end_time);

  const rescheduled = !!x.rescheduled && x.old_start_time && x.old_end_time;
  const _oldStart = rescheduled ? new Date(x.old_start_time) : null;
  const _oldEnd = rescheduled ? new Date(x.old_end_time) : null;

  const dateText = rescheduled
    ? `
      <div>
        <div style="color:#d97706;font-weight:700">
          ${fmtDate(_start)} ${fmtTime(_start)}–${fmtTime(_end)} น.
          <span style="background:#fff7ed;color:#d97706;border:1px solid #fed7aa;padding:2px 8px;border-radius:9999px;font-size:12px;margin-left:6px">
            ⏱️ เปลี่ยนเวลา
          </span>
        </div>
        <div style="color:#6b7280;font-size:12px;margin-top:2px">
          เดิม: <s>${fmtDate(_oldStart!)} ${fmtTime(_oldStart!)}–${fmtTime(_oldEnd!)} น.</s>
        </div>
      </div>
    `
    : `${fmtDate(_start)} ${fmtTime(_start)}–${fmtTime(_end)} น.`;

  const badge = (status?: string) => {
    if (status === "accepted") return `<span style="color:#10b981;font-weight:600">✅ ยืนยันแล้ว</span>`;
    if (status === "rejected") return `<span style="color:#ef4444;font-weight:600">❌ ปฏิเสธแล้ว</span>`;
    return `<span style="color:#f59e0b;font-weight:600">⌛ รอดำเนินการ</span>`;
  };

  const isPending = !x.status || x.status === "pending";

  return `
    <div style="background:#fff;padding:12px 14px;border-radius:12px;margin-bottom:10px;border:1px solid #eee;text-align:left">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div style="font-weight:700">Psychologist</div>
        <div>${badge(x.status)}</div>
      </div>
      <div style="margin:6px 0 2px">
        <b>เวลา:</b> ${dateText}
      </div>
      <div style="color:#444"><b>รายละเอียด:</b> ${x.detail || "—"}</div>
      ${
        isPending
          ? `
        <div style="display:flex;gap:10px;margin-top:10px">
          <button
            data-act="accept"
            data-id="${x.appointment_id}"
            style="flex:1;background:#d1e7dd;border:none;padding:8px 10px;border-radius:8px;cursor:pointer"
          >✅ ยืนยันการนัด</button>
          <button
            data-act="reject"
            data-id="${x.appointment_id}"
            style="flex:1;background:#f8d7da;border:none;padding:8px 10px;border-radius:8px;cursor:pointer"
          >❌ ปฏิเสธการนัด</button>
        </div>`
          : ``
      }
    </div>
  `;
};
const LABEL_MORE = "ดูเพิ่ม";
const LABEL_LESS = "ย่อ";

const html = `
  <style>
    .qewty-divider{height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:8px 0 4px}
    .qewty-toggle-wrap{display:flex;justify-content:center;margin-top:8px}
    .qewty-toggle-btn{
      appearance:none; border:1px solid #e5e7eb; background:linear-gradient(180deg,#ffffff,#f8fafc);
      border-radius:9999px; padding:8px 14px; font-weight:600; font-size:12.5px; cursor:pointer;
      display:inline-flex; align-items:center; gap:8px; 
      box-shadow:0 1px 2px rgba(15,23,42,.06), inset 0 0 0 1px #fff;
      transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
    }
    .qewty-toggle-btn:hover{transform:translateY(-1px);border-color:#d1d5db;box-shadow:0 6px 12px rgba(15,23,42,.08)}
    .qewty-toggle-btn:active{transform:translateY(0)}
    .qewty-toggle-chip{
      background:#111827; color:#fff; border-radius:9999px; font-weight:700; font-size:11px;
      padding:2px 8px; line-height:1;
    }
    .qewty-toggle-icn{font-size:12px; opacity:.8}
  </style>

  <div style="text-align:left">
    <h3 style="margin:0 0 8px">นัดหมายทั้งหมด</h3>

    <div style="margin:12px 0 6px;color:#555">กำลังจะถึง</div>
    <div id="upcomingList"></div>
    ${
      upcoming.length > 5
        ? `
          <div class="qewty-divider"></div>
          <div class="qewty-toggle-wrap">
            <button id="toggleUpcomingBtn" class="qewty-toggle-btn" type="button" aria-expanded="false">
              <span class="qewty-toggle-text">${LABEL_MORE}</span>
              <span class="qewty-toggle-chip">+${upcoming.length - 5}</span>
              <span class="qewty-toggle-icn">▾</span>
            </button>
          </div>
        `
        : ``
    }

    <div style="margin:16px 0 6px;color:#555">ที่ผ่านมา</div>
    <div id="pastList"></div>
    ${
      past.length > 5
        ? `
          <div class="qewty-divider"></div>
          <div class="qewty-toggle-wrap">
            <button id="togglePastBtn" class="qewty-toggle-btn" type="button" aria-expanded="false">
              <span class="qewty-toggle-text">${LABEL_MORE}</span>
              <span class="qewty-toggle-chip">+${past.length - 5}</span>
              <span class="qewty-toggle-icn">▾</span>
            </button>
          </div>
        `
        : ``
    }
  </div>
`;

Swal.fire({
  html,
  width: 640,
  showCloseButton: true,
  showConfirmButton: false,
  didOpen: () => {
    const upcomingListEl = document.getElementById("upcomingList");
    const pastListEl = document.getElementById("pastList");
    const toggleUpcomingBtn = document.getElementById("toggleUpcomingBtn") as HTMLButtonElement | null;
    const togglePastBtn = document.getElementById("togglePastBtn") as HTMLButtonElement | null;

    let showAllUpcoming = false;
    let showAllPast = false;

    const bindActionButtons = () => {
      document.querySelectorAll<HTMLButtonElement>("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");
          const apptId = btn.getAttribute("data-id");
          if (!apptId) return;
          if (act === "accept") {
            (window as any).confirmAppointment?.(apptId, "accepted");
            updateNoticeStatus(apptId!, "accepted");
          } else if (act === "reject") {
            (window as any).confirmAppointment?.(apptId, "rejected");
            updateNoticeStatus(apptId!, "rejected");
          }
        });
      });
    };

    const updateToggleBtn = (
      btn: HTMLButtonElement | null,
      expanded: boolean,
      remainCount: number
    ) => {
      if (!btn) return;
      const txt = btn.querySelector(".qewty-toggle-text") as HTMLElement | null;
      const chip = btn.querySelector(".qewty-toggle-chip") as HTMLElement | null;
      const icn = btn.querySelector(".qewty-toggle-icn") as HTMLElement | null;

      if (txt) txt.textContent = expanded ? LABEL_LESS : LABEL_MORE;
      if (icn) icn.textContent = expanded ? "▴" : "▾";
      if (chip) {
        chip.textContent = `+${remainCount}`;
        chip.style.display = expanded || remainCount <= 0 ? "none" : "inline-block";
      }
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    };

    const renderSection = () => {
      // upcoming
      if (upcomingListEl) {
        const upArr = showAllUpcoming ? upcoming : upcoming.slice(0, 5);
        upcomingListEl.innerHTML = upArr.length
          ? upArr.map(renderItem).join("")
          : `<div style="color:#777">— ไม่มี —</div>`;
      }
      // past
      if (pastListEl) {
        const pastArr = showAllPast ? past : past.slice(0, 5);
        pastListEl.innerHTML = pastArr.length
          ? pastArr.map(renderItem).join("")
          : `<div style="color:#777">— ไม่มี —</div>`;
      }

      updateToggleBtn(toggleUpcomingBtn, showAllUpcoming, Math.max(0, upcoming.length - 5));
      updateToggleBtn(togglePastBtn, showAllPast, Math.max(0, past.length - 5));

      bindActionButtons(); // re-bind หลัง innerHTML ถูกแทนที่
    };

    toggleUpcomingBtn?.addEventListener("click", () => {
      showAllUpcoming = !showAllUpcoming;
      renderSection();
    });
    togglePastBtn?.addEventListener("click", () => {
      showAllPast = !showAllPast;
      renderSection();
    });

    renderSection(); // ครั้งแรก: โชว์ 5 รายการ/กลุ่ม
  },
});
};



function openChecklistModal(startDate?: Date) {
  let current = startDate ? new Date(startDate) : new Date();

  const render = () => {
    const state = loadDay(current);
    const progress = (() => {
      const total = state.tasks.length;
      const done = Object.values(state.done).filter(Boolean).length;
      return total ? Math.round((done / total) * 100) : 0;
    })();

    // HTML ภายใน Swal
    const html =  `
      <div style="text-align:left">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">
          <button id="prevDay" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer">◀ Yesterday</button>
          <div style="font-weight:700">${current.toLocaleDateString()}</div>
          <button id="nextDay" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer">Tomorrow ▶</button>
        </div>

        <div style="margin:8px 0 14px;font-size:0.95rem;color:#555">
          Progress: <b>${progress}%</b>
          <div style="height:8px;background:#eee;border-radius:9999px;margin-top:6px;overflow:hidden">
            <div style="height:100%;width:${progress}%;background:#3b82f6"></div>
          </div>
        </div>

        <ul id="checklistUl" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px">
          ${state.tasks.map((t) => {
            const checked = state.done[t.id] ? "checked" : "";
            return  `
              <li style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;border:1px solid #eee;border-radius:10px;background:#f9fafb">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1">
                  <input type="checkbox" data-task="${t.id}" ${checked} />
                  <span>${t.label}</span>
                </label>
                <span style="min-width:100px;text-align:right;color:${state.done[t.id] ? "#059669" : "#b40909ff"};font-weight:600">
                  ${state.done[t.id] ? "Completed" : "Incomplete"}
                </span>
              </li>
             `;
          }).join("")}
        </ul>
      </div>
     `;

    Swal.fire({
      title: "Checklist วันนี้",
      html,
      width: 620,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        // ปุ่มเปลี่ยนวัน
        const prev = document.getElementById("prevDay");
        const next = document.getElementById("nextDay");
        prev?.addEventListener("click", () => { current = addDays(current, -1); render(); });
        next?.addEventListener("click", () => { current = addDays(current, 1); render(); });

        // เช็คบ็อกซ์
        document.querySelectorAll<HTMLInputElement>("#checklistUl input[type=checkbox]")
          .forEach((cb) => {
            cb.addEventListener("change", () => {
              const id = cb.getAttribute("data-task") as TaskId;
              const st = loadDay(current);
              st.done[id] = cb.checked;
              saveDay(st);
              // re-render เพื่ออัปเดตสถานะ/แถบ progress
              render();
            });
          });
      }
    });
  };

  render();
}

/*const handleShowAppointments = () => {
  const notices = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");

  const filtered = notices.filter((item: any) => {
    const start = new Date(item.start_time);
    const now = new Date();
    return (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 2;
  });

  if (!filtered.length) {
    Swal.fire({
      title: "การแจ้งเตือน",
      text: "ไม่มีการแจ้งเตือน",
      icon: "info",
    });
    return;
  }

const htmlContent = `
  <div style="background-color: #e0f2ff; padding: 20px; border-radius: 16px;">
    <h3 style="margin-bottom: 15px; text-align: center;">
      <img src="https://cdn-icons-png.flaticon.com/128/10215/10215675.png" width="32" style="vertical-align: middle; margin-right: 8px;" />
      แจ้งเตือนนัดหมาย
    </h3>
    ${filtered.slice(-99).map((item: any) => {
      const startTime = new Date(item.start_time);
      const endTime = new Date(item.end_time);
      const isConfirmed = item.status === "accepted" || item.status === "rejected";
      const statusText = item.status === "accepted" ? "✅ ยืนยันแล้ว" :
                         item.status === "rejected" ? "❌ ปฏิเสธแล้ว" : "";
      return `
        <div style="background: white; padding: 10px 16px; border-radius: 12px; margin-bottom: 10px; font-size: 0.99rem; text-align: left;">
          <div style="margin-bottom: 4px;"><b>ปรึกษาแพทย์</b> เวลานัด: ${startTime.toLocaleDateString()} 
            ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} น.
          </div>
          <div><b>รายละเอียด:</b> ${item.detail}</div>
          <div style="margin-top: 10px;">
            ${
              isConfirmed
                ? `<div style="color: #666; font-weight: 500;">${statusText} • ดำเนินการเรียบร้อยแล้ว</div>`
                : `
                  <div style="display: flex; gap: 10px;">
                    <button onclick="window.confirmAppointment('${item.appointment_id}', 'accepted')" style="flex:1; background:#d1e7dd; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">✅ ยืนยันการนัด</button>
                    <button onclick="window.confirmAppointment('${item.appointment_id}', 'rejected')" style="flex:1; background:#f8d7da; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">❌ ปฏิเสธการนัด</button>
                  </div>
                `
            }
          </div>
        </div>
      `;
    }).join("")}
  </div>
`;


  Swal.fire({
    html: htmlContent,
    width: 600,
    showCloseButton: true,
    showConfirmButton: false,
  });

  localStorage.setItem(NOTICE_FLAG_KEY, "false");
};*/
const stripHtml = (s?: string | null) => (s ? s.replace(/<[^>]*>?/gm, "") : "");
   return (
  <div className="dash-frame">
  <div className="dash-content">
    <div className="deer-dashboard-container">
      
      <div className="diorr-card1">
        <div className="diorr-card-header">
          <div className="diorr-card-title">
            <h3>Daily Progress</h3>
            <img src="https://cdn-icons-png.flaticon.com/128/5948/5948941.png" alt="Daily Progress Icon" className="diorr-icon" />
          </div>
          <span className="diorr-stat-text">{completed}/{total}</span>
          <div className="diorr-progress-bar">
            <div className="diorr-progress" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="diorr-card2">
        <div className="diorr-card-header">
          <div className="diorr-card-title">
            <h3>Diary Entries</h3>
            <img src="https://cdn-icons-png.flaticon.com/128/8275/8275593.png" alt="Diary Entries Icon" className="diorr-icon" />
          </div>
          <span className="diorr-stat-text">{monthCount}</span>
          <span className="diorr-stat-subtext">This month</span>
        </div>
      </div>

      <div className="diorr-card3">
        <div className="diorr-card-header">
          <div className="diorr-card-title">
            <h3>Thought Records</h3>
            <img src="https://cdn-icons-png.flaticon.com/128/109/109827.png" alt="Thought Records Icon" className="diorr-icon" />
          </div>
          <span className="diorr-stat-text">8</span>
          <span className="diorr-stat-subtext">This week</span>
        </div>
      </div>
      <div className="diorr-card4">
        <div className="diorr-card-header">
          <div className="diorr-card-title">
            <h3>Next Appointment</h3>
            <img src="https://cdn-icons-png.flaticon.com/128/2948/2948088.png" alt="Next Appointment Icon" className="diorr-icon" />
          </div>

          <span className="diorr-stat-text">
            {daysAway === null ? "—" : daysAway}
          </span>

          <span className="diorr-stat-subtext">
            {daysDiff === 0 && nextAppointmentText !== "ไม่มีนัดหมายเร็ว ๆ นี้"
              ? "Today"
              : daysDiff === 1
              ? "Tomorrow"
              : "Days away"}
          </span>
        </div>

        {/* วันที่-เวลา */}
        <div style={{ marginTop: 8, fontSize: "0.9em", color: "#666" }}>
          {nextAppointmentText}
        </div>
      </div>


 {/* Lower Section */}
<div className="deer-tiger-dashboard-container">

  {/* Daily Checklist */}
  <div className="deer-tiger-card">
  <div className="hior-title">
    <img src="https://cdn-icons-png.flaticon.com/128/5948/5948941.png" alt="Checklist Icon" className="frio-icon" />
    <h3>Daily Checklist</h3>
  </div>
  <p className="deer-tiger-subtext">Track your daily wellness activities</p>

  <ul className="deer-tiger-checklist">
  {checklist.tasks.map(({ id, label }) => {
    const done = checklist.done[id];
    const iconSrc = done ? ICON_CHECKED : ICON_UNCHECKED;

    return (
      <li key={id} onClick={() => toggleTask(id)} className="deer-tiger-item">
        <div className="deer-item-left">
          <img src={iconSrc} alt={done ? "Done" : "Todo"} className="deer-check-icon" />
          <span className="deer-item-label">{label}</span>
        </div>
        <span className={`deer-tiger-status ${done ? "completed" : "pending"}`}>
          {done ? "Completed" : "Incomplete"}
        </span>
      </li>
    );
  })}
</ul>


  <button
  className="deer-tiger-btn"
  onClick={() => openChecklistModal()}
>
  View More
</button>

</div>


 {/* Diary */}
<div className="deer-tiger-card">
  <div className="hior-title">
    <img
      src="https://cdn-icons-png.flaticon.com/128/8275/8275593.png"
      alt="Diary Icon"
      className="frio-icon"
    />
    <h3>Diary</h3>
  </div>

  <p className="deer-tiger-subtext">Your personal thoughts and reflections</p>

  {loading ? (
    // --- แสดงโหลดเฉพาะส่วนนี้ (ไม่บล็อกทั้งหน้า) ---
    <>
      <p className="deer-tiger-diary-entry">
        <span className="diary-entry-header">
          <strong>Today’s Entry</strong>
          <span className="diary-entry-time">กำลังโหลด…</span>
        </span>
        <span className="diary-entry-content"> </span>
      </p>
      <p className="deer-tiger-diary-entry">
        <span className="diary-entry-header">
          <strong>Yesterday</strong>
          <span className="diary-entry-time">กำลังโหลด…</span>
        </span>
        <span className="diary-entry-content"> </span>
      </p>
    </>
  ) : (
    <>
      <p className="deer-tiger-diary-entry">
        <span className="diary-entry-header">
          <strong>Today’s Entry</strong>
          <span className="diary-entry-time">
            {today?.UpdatedAt ? relTime(today.UpdatedAt) : "—"}
          </span>
        </span>
       <span className="diary-entry-content">
    {
      today
        ? highlightText(
            (stripHtml(today.Content).slice(0, 120) ||
              today.Title ||
              "ยังไม่มีบันทึกวันนี้")
          )
        : "ยังไม่มีบันทึกวันนี้"
    }
  </span>
      </p>

       <p className="deer-tiger-diary-entry">
      <span className="diary-entry-header">
        <strong>Last Week</strong>
        <span className="diary-entry-time">
          {week?.UpdatedAt ? relTime(week.UpdatedAt) : "—"}
        </span>
      </span>
      <span className="diary-entry-content">
  {
    week
      ? highlightText(
          (stripHtml(week.Content).slice(0, 120) ||
            week.Title ||
            "ยังไม่มีบันทึกสัปดาห์ที่ผ่านมา")
        )
      : "ยังไม่มีบันทึกสัปดาห์ที่ผ่านมา"
  }
</span>

    </p>
    </>
  )}

  <button
    className="deer-tiger-btn"
    onClick={() => navigate("/patient/diary")}
    disabled={loading}
  >
    View More
  </button>
</div>


  {/* Thought Record */}
  <div className="deer-tiger-card">
     <div className="hior-title">
      <img
        src="https://cdn-icons-png.flaticon.com/128/109/109827.png"
        alt="Thought Record Icon"
        className="frio-icon"
      />
      <h3>Thought Record</h3>
    </div>
      <p className="deer-tiger-subtext">Cognitive behavioral therapy tracking</p>
  <div className="deer-tiger-thought-entry">
  <div className="deer-tiger-thought-header">
    <strong>Work Anxiety</strong>
    <span className="deer-tiger-tag high">High</span>
  </div>
  <p className="deer-tiger-thought-sub">Situation: Big presentation tomorrow</p>
</div>

<div className="deer-tiger-thought-entry">
  <div className="deer-tiger-thought-header">
    <strong>Social Worry</strong>
    <span className="deer-tiger-tag medium">Medium</span>
  </div>
  <p className="deer-tiger-thought-sub">Situation: Meeting new people at event</p>
</div>


    <button
  className="deer-tiger-btn"
  onClick={() => navigate("/patient/thought_records")}
>
  View More
</button>

  </div>

<div className="deer-tiger-card">
  <div className="hior-title">
    <img
      src="https://cdn-icons-png.flaticon.com/128/2948/2948088.png"
      alt="Appointments Icon"
      className="frio-icon"
    />
    <h3>Appointments</h3>
  </div>
  <p className="deer-tiger-subtext">Upcoming therapy sessions</p>

  {upcomingNotices.length === 0 ? (
    <div className="appointment-entry">
      <div className="appointment-header">
        <strong>—</strong>
        <span className="appointment-date">—</span>
      </div>
      <p className="appointment-detail">ไม่มีนัดหมายเร็ว ๆ นี้</p>
      <p className="appointment-time">—</p>
    </div>
  ) : (
    upcomingNotices.slice(0, 2).map((it, idx) => {
      const s = new Date(it.start_time);
      const e = new Date(it.end_time);
      const dateText = fmtDateShortTH(s);
      const timeText = `${fmtTime(s)}–${fmtTime(e)}`;

      // ไม่มีชื่อหมอใน payload ปัจจุบัน → ใส่ค่า default หรือต้องให้ backend ส่งชื่อมา
      const doctorName = "Psychologist";

      return (
        <div key={it.appointment_id ?? idx} className="appointment-entry">
          <div className="appointment-header">
            <strong>{doctorName}</strong>
            <span className="appointment-date">{dateText}</span>
          </div>
          <p className="appointment-detail">{it.detail || "—"}</p>
          <p className="appointment-time">{timeText}</p>
        </div>
      );
    })
  )}

  <button
  className="deer-tiger-btn"
  onClick={handleShowAppointmentsAll}
>
  View More
</button>

</div>
{/* ===== Summary Diary Text (aertr) ===== */}
<div className="aertr-overall-container">
  <div className="aertr-summary-card">
    {/* Left */}
    <div className="aertr-summary-left">
      <h3 className="aertr-summary-title">Summary Diary Text</h3>
      <div
        style={{
          marginTop: 12,
          padding: "12px 14px",
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <DiaryStatsChart diaries={diaries} dateField="UpdatedAt" />
      </div>

      <p className="aertr-emotion-label">
        Current Emotion
      </p>

      <div className="aertr-emotion-legend">
        {TAGS.map((t) => {
          const key = norm(t);
          const active = detectedEmotions.map(norm).includes(key);
          const icon = EMOJI[key] || "🙂";
          return (
            <span
              key={t}
              className={`aertr-emotion ${toClass(t)} ${
                active ? "active" : ""
              }`}
              title={t}
            >
              {icon} {t}
            </span>
          );
        })}
      </div>
    </div>

    {/* Right */}
    <div className="aertr-summary-right">
      <div className="aertr-trend-box">
        <div className="aertr-tab-buttons">
         <button
  className={`aertr-tab ${statTab === "daily" ? "active" : ""}`}
  onClick={() => onTab("daily")}
  disabled={isSummarizingStats}
>
  {isSummarizingStats && statTab === "daily" ? "Loading…" : "Daily"}
</button>

<button
  className={`aertr-tab ${statTab === "weekly" ? "active" : ""}`}
  onClick={() => onTab("weekly")}
  disabled={isSummarizingStats}
>
  {isSummarizingStats && statTab === "weekly" ? "Loading…" : "Weekly"}
</button>

<button
  className={`aertr-tab ${statTab === "monthly" ? "active" : ""}`}
  onClick={() => onTab("monthly")}
  disabled={isSummarizingStats}
>
  {isSummarizingStats && statTab === "monthly" ? "Loading…" : "Monthly"}
</button>

        </div>

        <div className="aertr-trend-content">
          <h4>
            {statTab === "daily"
              ? "Daily"
              : statTab === "weekly"
              ? "This Week"
              : "This Month"}
          </h4>

          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              border: "1px solid #eee",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              {statTab === "daily"
                ? "สรุปวันนี้"
                : statTab === "weekly"
                ? "สรุปรายสัปดาห์"
                : "สรุปรายเดือน"}
            </div>
          <div style={{ color: "#374151", lineHeight: 1.6 }}>
  {isSummarizingStats ? "กำลังสรุปข้อมูล…" : highlightText(summaryText)}
</div>


          </div>
        </div>
      </div>
    </div>
     <div className="aertr-side-panel">
    {/* AI Feedback */}
    <div className="aertr-feedback-card">
      <h4 className="aertr-feedback-title">
    <img
      src="https://cdn-icons-png.flaticon.com/128/11213/11213138.png"
      alt="Feedback Icon"
      className="aertr-feedback-icon"
    />
    Diary Feedback
  </h4>
      <p className="aertr-feedback-positive">
        <strong>Positive Trend Detected</strong><br />
        Your entries show increased gratitude mentions this week
      </p>
      <p className="aertr-feedback-suggestion">
        <strong>Suggestion</strong><br />
        Consider exploring stress management techniques
      </p>
      <button className="aertr-feedback-btn">View More</button>
    </div>
         
    {/* Previous Entries */}
    <div className="aertr-previous-card">
      <h4>Previous Entries</h4>
      <div className="aertr-previous-entry">
        <p className="aertr-entry-date">July 31, 2024</p>
        <p className="aertr-entry-text">
          Today was a busy day at work. Had several meetings, and then spent the afternoon debugging a tricky issue in the new feature...
        </p>
 </div>
      </div>
      
    </div>
    
  </div>
  
</div>
</div>
<div className="qewty-summary-container">
  {/* Left Section: Pie Chart and Emotions */}
  <div className="qewty-summary-left">
  <h3 className="qewty-summary-title">Summary Thought Record (Emotional)</h3>

  {/* Pie Chart + Legend side-by-side */}
  <div className="qewty-chart-legend-row">
    <div className="qewty-pie-chart">[Pie Chart Placeholder]</div>

    <div className="qewty-legend">
      <div className="qewty-legend-label">
        <div className="label"><span className="dot happy"></span> Happy</div>
        <div className="percent">22.5%</div>
      </div>
      <div className="qewty-legend-label">
        <div className="label"><span className="dot sad"></span> Sad</div>
        <div className="percent">8.1%</div>
      </div>
      <div className="qewty-legend-label">
        <div className="label"><span className="dot other"></span> Other</div>
        <div className="percent">30.8%</div>
      </div>
    </div>
  </div>

  {/* Chips below */}
  <div className="qewty-emotions">
    <span className="qewty-chip happy">😊 Happy</span>
    <span className="qewty-chip sad">😢 Sad</span>
    <span className="qewty-chip neutral">😐 Neutral</span>
    <span className="qewty-chip angry">😠 Angry</span>
    <span className="qewty-chip excited">🤩 Excited</span>
    <span className="qewty-chip anxious">😰 Anxious</span>
    <span className="qewty-chip grateful">💖 Grateful</span>
  </div>



 <div className="qewty-recent-entries">
  <h4>Recent Entries</h4>
  <p className="qewty-subtext">Your emotional journey</p>

  <div className="qewty-entry-list">
    <div className="qewty-entry-card">
      <div className="qewty-entry-header">
        <div className="qewty-entry-label">
        <img src="https://cdn-icons-png.flaticon.com/128/1581/1581730.png" alt="Happy Icon" className="qewty-entry-icon" />
        <strong>Happy</strong>
        </div>
        <span className="qewty-entry-date">Jan 15</span>
      </div>
      <p className="qewty-entry-text">Had a great day at work today. The project presentation went really well...</p>
    </div>

    <div className="qewty-entry-card">
      <div className="qewty-entry-header">
         <div className="qewty-entry-label">
        <img src="https://cdn-icons-png.flaticon.com/128/4691/4691328.png" alt="Anxious Icon" className="qewty-entry-icon" />
        <strong>Anxious</strong>
        </div>
        <span className="qewty-entry-date">Jan 14</span>
      </div>
      <p className="qewty-entry-text">Feeling nervous about tomorrow's presentation. Need to practice more...</p>
    </div>

    <div className="qewty-entry-card">
      <div className="qewty-entry-header">
          <div className="qewty-entry-label">
        <img src="https://cdn-icons-png.flaticon.com/128/17813/17813344.png" alt="Grateful Icon" className="qewty-entry-icon" />
        <strong>Grateful</strong>
        </div>
        <span className="qewty-entry-date">Jan 13</span>
      </div>
      <p className="qewty-entry-text">Spent time with family today. Really appreciate these moments...</p>
    </div>
  </div>

</div>

  </div>

 <div className="qewty-summary-right">
  

  {/* ✅ ห่อกล่อง Stats & Feedback ด้วย div นี้ */}
  <div className="qewty-right-row">

    <div className="qewty-stats-box">
      <div className="qewty-tabs">
    <button className="active">Daily</button>
    <button>Weekly</button>
    <button>Monthly</button>
  </div>
     <div className="qewty-stats-content">
    <div className="qewty-stats-title">This Week</div>
    <div className="qewty-stats-subtitle">Emotional patterns</div>

    <div className="qewty-stats-row">
      <span className="qewty-stats-label">Most Common</span>
      <span className="qewty-chip happy">😊 Happy</span>
    </div>

    <div className="qewty-stats-row">
      <span className="qewty-stats-label">Entries</span>
      <span className="qewty-stats-value">7 this week</span>
    </div>

    <div className="qewty-stats-row">
      <span className="qewty-stats-label">Streak</span>
      <span className="qewty-stats-value">3 days</span>
    </div>
  </div>
  </div>
  </div>
  
   
</div>
 <div className="qewty-feedback-card">
      <h4 className="qewty-feedback-title">
        <img
          src="https://cdn-icons-png.flaticon.com/128/11213/11213138.png"
          alt="Feedback Icon"
          className="qewty-feedback-icon"
        />
        Thought Record Feedback
      </h4>
      <p className="qewty-feedback-subtitle">CBT progress and insights</p>

      <div className="qewty-feedback-box qewty-green-box">
        <p className="qewty-feedback-box-title">Progress Made</p>
        <p className="qewty-feedback-box-text">
          You’re identifying cognitive distortions more effectively
        </p>
      </div>

      <div className="qewty-feedback-box qewty-purple-box">
        <p className="qewty-feedback-box-title">Pattern Identified</p>
        <p className="qewty-feedback-box-text">
          Catastrophizing appears in 60% of your records
        </p>
      </div>

      <button className="qewty-feedback-btn">View More</button>
    </div>
</div>
</div>
</div>

</div>
  );
};
 


export default HomePage;
