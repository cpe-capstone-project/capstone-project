import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./tailwind.css";
import DiarySummary from "../diary_summary/DiarySummary";
import { GetDiaryCountThisMonth } from "../../services/https/Diary";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";
//import pamemo1 from "../assets/pamemo1.png"; // ปรับ path ให้ถูกต้องตามโปรเจกต์คุณ

function HomePage() {

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


// ---- utils ----
const STORAGE_KEY = "daily-checklist-v2"; // เปลี่ยน key กันชนกับของเก่า
const todayKey = () => new Date().toISOString().slice(0, 10);
const dayIndex = (d = new Date()) => d.getDay(); // 0=Sun ... 6=Sat
const FORCE_DAY_INDEX: number | null = 0; // 0=Day1, 1=Day2,...; ใส่ null ถ้าอยาก auto ตามวันอาทิตย์ถึงเสาร์
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
const STORAGE_KEY_BYDATE = "daily-checklist-bydate-v2";
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

    const today = new Date();
    //const todayStr = today.toLocaleDateString("th-TH");

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
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

      const existing = JSON.parse(localStorage.getItem("patient_notifications") || "[]");
      const updated = [...existing, {
        start_time: data.start_time,
        end_time: data.end_time,
        detail: data.detail,
        appointment_id: data.appointment_id,
      }];
      localStorage.setItem("patient_notifications", JSON.stringify(updated));
      localStorage.setItem("has_new_notice", "true");

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
  } else if (result.isDenied) {
    window.confirmAppointment(data.appointment_id, "rejected");
  } else if (result.dismiss === Swal.DismissReason.cancel) {
    console.log("❎ ยกเลิกการตอบกลับ");
  }
});


    }
  };

  return () => socket.close();
}, []);
 
const [nextAppointmentText, setNextAppointmentText] = useState("ไม่มีนัดหมายเร็ว ๆ นี้");

useEffect(() => {
  const allNotices = JSON.parse(localStorage.getItem("patient_notifications") || "[]");
  const now = new Date();

  const upcoming = allNotices
    .map((item: any) => ({
      ...item,
      start: new Date(item.start_time),
      end: new Date(item.end_time),
    }))
    .filter((item: any) => item.start > now)
    .sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const startDate = next.start.toLocaleDateString("th-TH");
    const startTime = next.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const endTime = next.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setNextAppointmentText( `${startDate} ${startTime}–${endTime} น. `);
  }
}, []);
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

const handleShowAppointments = () => {
  const notices = JSON.parse(localStorage.getItem("patient_notifications") || "[]");

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

  localStorage.setItem("has_new_notice", "false");
};
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
        <img src="https://cdn-icons-png.flaticon.com/128/2948/2948088.png" alt="Next Appointment Icon" className="diorr-icon" />
      </div>
      <span className="diorr-stat-text">2</span>
      <span className="diorr-stat-subtext">Days away</span>
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
      <p className="deer-tiger-diary-entry">
  <span className="diary-entry-header">
    <strong>Today’s Entry</strong>
    <span className="diary-entry-time">2 hours ago</span>
  </span>
  <span className="diary-entry-content">
    "Had a productive day at work. Feeling grateful for..."
  </span>
</p>
<p className="deer-tiger-diary-entry">
  <span className="diary-entry-header">
    <strong>Yesterday</strong>
    <span className="diary-entry-time">1 day ago</span>
  </span>
  <span className="diary-entry-content">
    "Challenging day but managed to stay positive..."
  </span>
</p>

     <button
      className="deer-tiger-btn"
      onClick={() => navigate("/patient/diary")}
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


    <button className="deer-tiger-btn">View More</button>
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

  {/* Appointment Entry */}
  <div className="appointment-entry">
    <div className="appointment-header">
      <strong>Dr. Sarah Johnson</strong>
      <span className="appointment-date">Dec 15</span>
    </div>
    <p className="appointment-detail">Cognitive Behavioral Therapy</p>
    <p className="appointment-time">2:00 PM</p>
  </div>

  <div className="appointment-entry">
    <div className="appointment-header">
      <strong>Dr. Michael Chen</strong>
      <span className="appointment-date">Dec 22</span>
    </div>
    <p className="appointment-detail">Psychiatrist</p>
    <p className="appointment-time">10:30 AM</p>
  </div>

  <button className="deer-tiger-btn">View More</button>
</div>
<div className="aertr-overall-container">
{/* Emotion Summary Section (Combined Card) */}
<div className="aertr-summary-card">
  {/* Left: Chart & Emotion Legend */}
  <div className="aertr-summary-left">
    <h3 className="aertr-summary-title">Summary Diary Text</h3>
    <div className="aertr-chart-placeholder">[Chart Placeholder]</div>
     <p className="aertr-emotion-label">Current Emotion</p>
    <div className="aertr-emotion-legend">
      <span className="aertr-emotion happy">😊 Happy</span>
      <span className="aertr-emotion sad">😢 Sad</span>
      <span className="aertr-emotion neutral">😐 Neutral</span>
      <span className="aertr-emotion angry">😠 Angry</span>
      <span className="aertr-emotion excited">🤩 Excited</span>
      <span className="aertr-emotion anxious">😰 Anxious</span>
      <span className="aertr-emotion grateful">💖 Grateful</span>
    </div>
  </div>

  {/* Right: Tabs + Feedback + Previous */}
  <div className="aertr-summary-right">
    {/* Tabs + Weekly Stats */}
    <div className="aertr-trend-box">
      <div className="aertr-tab-buttons">
        <button className="aertr-tab active">Daily</button>
        <button className="aertr-tab">Weekly</button>
        <button className="aertr-tab">Monthly</button>
      </div>
     <div className="aertr-trend-content">
  <h4>This Week</h4>
  <p className="aertr-row">
    <span className="aertr-label">Most Common</span>
    <span className="aertr-value">
      <span className="aertr-badge">😊 Happy</span>
    </span>
  </p>
  <p className="aertr-row">
    <span className="aertr-label">Entries</span>
    <span className="aertr-value">7 this week</span>
  </p>
  <p className="aertr-row">
    <span className="aertr-label">Streak</span>
    <span className="aertr-value">3 days</span>
  </p>
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
