
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
// --- เพิ่มบนสุดของไฟล์ (นอก component) ---
// เพิ่มตรงหัวไฟล์
import DiaryStatsChart from "../../components/DiaryStatsChart/DiaryStatsChart";
import { useDiary } from "../../contexts/DiaryContext";
import { useDiarySummary, TAGS } from "../../hooks/useDiarySummary";
import { useMemo } from "react";
function HomePage() {
  // ใส่ไว้ในฟังก์ชัน HomePage() ด้านบน ๆ ใกล้ ๆ state อื่น ๆ
const { diaries } = useDiary();

  const [today, setToday] = useState<DiaryInterface | null>(null);
  const [week, setWeek] = useState<DiaryInterface | null>(null);
  const [loading, setLoading] = useState(true);
// แปลงแท็บ -> label ภาษาไทยที่ backend ใช้
/*const tabToLabelTH = (tab: "daily" | "weekly" | "monthly"): "รายวัน" | "รายสัปดาห์" | "รายเดือน" => {
  if (tab === "weekly") return "รายสัปดาห์";
  if (tab === "monthly") return "รายเดือน";
  return "รายวัน";
};*/

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
  ];
  return Array.from(new Set(arr.map((t) => t.trim()).filter(Boolean)));
}, [detectedEmotions, currentEmotion]);

// ✅ กัน RegExp พัง
const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ✅ ไฮไลต์คำใน text -> คืน JSX
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

 // const formattedDate = currentDate.toLocaleDateString("th-TH");
// วางไว้ใกล้ๆ ฟังก์ชันอื่นๆ ใน HomePage
// วางไว้ใกล้ๆ ฟังก์ชันอื่นๆ ใน HomePage
const updateNoticeStatus = (
  appointmentId: string | number,
  status: "accepted" | "rejected"
): boolean => {
  // อ่านและกันพังจาก localStorage
  let list: any[] = [];
  try {
    const raw = localStorage.getItem(NOTI_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    list = Array.isArray(parsed) ? parsed : [];
  } catch {
    list = [];
  }

  // หาเป้าหมาย
  const idx = list.findIndex(
    (x) => String(x.appointment_id) === String(appointmentId)
  );
  if (idx === -1) {
    console.warn("updateNoticeStatus: appointment not found", appointmentId);
    return false;
  }

  // อัปเดตเฉพาะเมื่อมีการเปลี่ยนสถานะจริง
  if (list[idx].status !== status) {
    list[idx] = {
      ...list[idx],
      status,
      _updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(NOTI_KEY, JSON.stringify(list));

    // กระตุ้นให้ส่วนอื่นๆ รีเฟรช (ภายในแท็บเดียวกัน)
    window.dispatchEvent(new Event("calendarEventsUpdated"));

    // ถ้าอยากให้ useEffect ที่ฟัง "storage" ในแท็บเดียวกันทำงานด้วย ก็ยิง custom event เอง
    // (หมายเหตุ: 'storage' จริงๆ จะยิงข้ามแท็บเท่านั้น)
    window.dispatchEvent(new Event("storage"));
  }

  return true;
};



 useEffect(() => {
  const id = localStorage.getItem("id");
  if (!id) return;

  const socket = new WebSocket(`ws://localhost:8000/ws/${id}`);
  socket.onopen = () => console.log("✅ WebSocket opened");
  socket.onerror = (err) => console.error("❌ WebSocket error", err);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "appointment_created") {
      console.log("🔥 ได้รับนัดหมายใหม่");

      const existing = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
      const updated = [...existing, {
        start_time: data.start_time,
        end_time: data.end_time,
        detail: data.detail,
        appointment_id: data.appointment_id,
         status: "pending", 
      }];
      localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
localStorage.setItem(NOTICE_FLAG_KEY, "true");

    const htmlContent = `
  <div style="background-color: #e0f2ff; padding: 20px; border-radius: 16px; text-align: left;">
    <h3 style="margin-bottom: 15px; text-align: center;">
      <img src="https://cdn-icons-png.flaticon.com/128/10215/10215675.png" width="32" style="vertical-align: middle; margin-right: 8px;" />
      แจ้งเตือนนัดหมาย
    </h3>
    <div style="background: white; padding: 10px 16px; border-radius: 12px; margin-bottom: 10px; font-size: 0.9rem;">
      <div><b>ปรึกษาแพทย์</b> เวลานัด: ${new Date(data.start_time).toLocaleDateString()} 
        ${new Date(data.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${new Date(data.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} น.
      </div>
      <div><b>รายละเอียด:</b> ${data.detail}</div>
    </div>
  </div>
`;


 Swal.fire({
  html: htmlContent,
  width: 600,
  showDenyButton: true, // ✅ เพิ่ม
  showCancelButton: true,
  confirmButtonText: "✅ ยืนยันการนัด",
  denyButtonText: "❌ ปฏิเสธการนัด", // ✅ แยกปุ่ม deny ออกต่างหาก
  cancelButtonText: "ยกเลิก",
  showCloseButton: true,
}).then((result) => {
  if (result.isConfirmed) {
  window.confirmAppointment(data.appointment_id, "accepted");
  updateNoticeStatus(data.appointment_id, "accepted"); // ⬅️ เพิ่ม
} else if (result.isDenied) {
  window.confirmAppointment(data.appointment_id, "rejected");
  updateNoticeStatus(data.appointment_id, "rejected"); // ⬅️ เพิ่ม
}
 else if (result.dismiss === Swal.DismissReason.cancel) {
    console.log("❎ ยกเลิกการตอบกลับ");
  }
});


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

  const badge = (status?: string) => {
    if (status === "accepted") return `<span style="color:#10b981;font-weight:600">✅ ยืนยันแล้ว</span>`;
    if (status === "rejected") return `<span style="color:#ef4444;font-weight:600">❌ ปฏิเสธแล้ว</span>`;
    return `<span style="color:#f59e0b;font-weight:600">⌛ รอดำเนินการ</span>`;
  };

  const renderItem = (x: any) => {
    const dateText = `${fmtDate(x._start)} ${fmtTime(x._start)}–${fmtTime(x._end)} น.`;
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

  const html = `
    <div style="text-align:left">
      <h3 style="margin:0 0 8px">นัดหมายทั้งหมด</h3>

      <div style="margin:12px 0 6px;color:#555">กำลังจะถึง</div>
      ${upcoming.length ? upcoming.map(renderItem).join("") : `<div style="color:#777">— ไม่มี —</div>`}

      <div style="margin:16px 0 6px;color:#555">ที่ผ่านมา</div>
      ${past.length ? past.map(renderItem).join("") : `<div style="color:#777">— ไม่มี —</div>`}
    </div>
  `;

  Swal.fire({
    html,
    width: 640,
    showCloseButton: true,
    showConfirmButton: false,
    didOpen: () => {
      // delegate ปุ่มยืนยัน/ปฏิเสธ (ใช้ window.confirmAppointment ของคุณ)
      document.querySelectorAll<HTMLButtonElement>("button[data-act]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const act = btn.getAttribute("data-act");
          const apptId = btn.getAttribute("data-id");
          if (!apptId) return;
         if (act === "accept") {
  (window as any).confirmAppointment?.(apptId, "accepted");
  updateNoticeStatus(apptId!, "accepted"); // ⬅️ เพิ่ม
} else if (act === "reject") {
  (window as any).confirmAppointment?.(apptId, "rejected");
  updateNoticeStatus(apptId!, "rejected"); // ⬅️ เพิ่ม
}
        });
      });
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
   return (
   <div className="diorr-dashboard-container">
 <div className="diorr-card">
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


  <div className="diorr-card">
    <div className="diorr-card-header">
      <div className="diorr-card-title">
        <h3>Diary Entries</h3>
        <img src="https://cdn-icons-png.flaticon.com/128/8275/8275593.png" alt="Diary Entries Icon" className="diorr-icon" />
      </div>
      <span className="diorr-stat-text">{monthCount}</span>
      <span className="diorr-stat-subtext">This month</span>
    </div>
  </div>

  <div className="diorr-card">
    <div className="diorr-card-header">
      <div className="diorr-card-title">
        <h3>Thought Records</h3>
        <img src="https://cdn-icons-png.flaticon.com/128/109/109827.png" alt="Thought Records Icon" className="diorr-icon" />
      </div>
      <span className="diorr-stat-text">8</span>
      <span className="diorr-stat-subtext">This week</span>
    </div>
  </div>

 <div className="diorr-card">
  <div className="diorr-card-header">
    <div className="diorr-card-title">
      <h3>Next Appointment</h3>
      <img
        src="https://cdn-icons-png.flaticon.com/128/2948/2948088.png"
        alt="Next Appointment Icon"
        className="diorr-icon"
      />
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
              ? (
                  (today.Content ? today.Content.replace(/<[^>]*>?/gm, "") : "")
                    .slice(0, 120) ||
                  today.Title ||
                  "ยังไม่มีบันทึกวันนี้"
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
            ? (
                (week.Content ? week.Content.replace(/<[^>]*>?/gm, "") : "")
                  .slice(0, 120) ||
                week.Title ||
                "ยังไม่มีบันทึกสัปดาห์ที่ผ่านมา"
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
  );
};
 


export default HomePage;
