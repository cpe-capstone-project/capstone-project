import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { th, enUS } from "date-fns/locale";
import { k, KEYS } from "../../unid/storageKeys";
import PatientOverviewChart from "../../components/PatientOverviewChart/PatientOverviewChart";

import Customcalendar from "../../components/customcalendar/customcalendar";
const locales = {
  "en-US": enUS,
  th: th,
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});
interface CalendarEvent {
  id: number;
  title: string;
  detail: string; 
  start: Date;
  end: Date;
  patientIndex?: number;
  status?: "pending" | "accepted" | "rejected"; 
   rescheduled?: boolean;
  oldStart?: Date | string;
  oldEnd?: Date | string;
}
const Homedoc: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");
  const id = localStorage.getItem("id");
  const [, setLoading] = useState(true); // ✅ โหลดสถานะ
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
//const [searchTerm, setSearchTerm] = useState("");

//const filteredPatients = patients.filter((p) => {
  //const fullText = `${p.first_name} ${p.last_name} ${p.gender} ${p.age} ${p.birthday}`.toLowerCase();

  //return fullText.includes(searchTerm.toLowerCase());
//});
// เพิ่ม state ใหม่
// เดิม: const CAL_KEY = k(KEYS.CAL);

// ใหม่: ผูก key กับผู้ใช้ที่ล็อกอินอยู่
const CAL_KEY = React.useMemo(() => {
  const loginEmail =
    localStorage.getItem("currentLoginUser") ||
    localStorage.getItem("email") ||
    "anonymous";
  return `CAL:${loginEmail}`;   // หรือถ้าชอบใช้ id:  `CAL_ID:${id}`
}, []);
useEffect(() => {
  const oldKey = k(KEYS.CAL);      // key เดิมที่ใช้ร่วมกันทุกคน
  const oldVal = localStorage.getItem(oldKey);
  const newVal = localStorage.getItem(CAL_KEY);
  if (oldVal && !newVal) {
    localStorage.setItem(CAL_KEY, oldVal);   // migrate ครั้งเดียว
  }
}, [CAL_KEY]);
useEffect(() => {
  const loadEventsFromStorage = () => {
    const savedEvents = localStorage.getItem(CAL_KEY);

    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const eventsFromStorage = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
           ...(e.oldStart ? { oldStart: new Date(e.oldStart) } : {}),
           ...(e.oldEnd ? { oldEnd: new Date(e.oldEnd) } : {}),
        }));
        setEvents(eventsFromStorage);
      } catch (err) {
        console.error("โหลด events จาก localStorage ผิดพลาด", err);
        setEvents([]);
      }
    } else {
      setEvents([]);
    }
  };

  loadEventsFromStorage();
  window.addEventListener("calendarEventsUpdated", loadEventsFromStorage);
  return () => {
    window.removeEventListener("calendarEventsUpdated", loadEventsFromStorage);
  };
}, [CAL_KEY]); 
const saveEventsToLocal = (list: CalendarEvent[]) => {
  try {
    localStorage.setItem(CAL_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("save CAL failed", e);
  }
};

const [inTreatmentIds, setInTreatmentIds] = useState<number[]>([]);
const [completedIds, setCompletedIds] = useState<number[]>([]);
useEffect(() => {
  if (!id) return;

  // 1) ผู้ป่วยที่เริ่มทำกิจกรรม (Diary/TR)
  fetch(`http://localhost:8000/stats/patient-activity?psychologist_id=${id}`)
    .then(res => res.ok ? res.json() : Promise.reject("bad res"))
    .then((data: { diary_patient_ids?: number[]; tr_patient_ids?: number[] }) => {
      const diaryIds = new Set(data.diary_patient_ids || []);
      const trIds = new Set(data.tr_patient_ids || []);
      // union
      const union = new Set<number>([...diaryIds, ...trIds]);
      setInTreatmentIds(Array.from(union));
    })
    .catch(() => setInTreatmentIds([]));

  // 2) ผู้ป่วยที่อนุมัติ/ปิดเคสแล้ว
  fetch(`http://localhost:8000/therapy-cases/by-psychologist?psychologist_id=${id}`)
    .then(res => res.ok ? res.json() : Promise.reject("bad res"))
    .then((cases: Array<{ patient_id: number; status: string }>) => {
      const finished = cases.filter(c => c.status?.toLowerCase() === "approved" || c.status?.toLowerCase() === "completed");
      setCompletedIds(finished.map(c => c.patient_id));
    })
    .catch(() => setCompletedIds([]));
}, [id]);

const [stats, setStats] = useState([
  {
    title: "Total Patients",
    value: "0",
    subtitle: "—",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747376.png",
  },
  {
    title: "Upcoming Sessions",
    value: "12",
    subtitle: "5 this week",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747310.png",
  },
  {
    title: "Recent Activities",
    value: "34",
    subtitle: "New notes added today",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747327.png",
  },
]);
interface Patient {
  id: number; // ✅ เพิ่มบรรทัดนี้
  first_name: string;
  last_name: string;
  age: number | string;
  gender: string;
  birthday: string;
}
useEffect(() => {
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel("appointment_updates");
    bc.onmessage = (ev) => {
      const msg = ev.data || {};
      if (!msg || !msg.appointment_id || !msg.status) return;

      const newStatus = String(msg.status).toLowerCase() as "pending" | "accepted" | "rejected";
      setEvents((prev) => {
        const updated = prev.map((e) =>
          e.id === Number(msg.appointment_id) ? { ...e, status: newStatus } : e
        );
        saveEventsToLocal(updated);
        return updated;
      });
    };
  } catch (e) {
    // Safari private mode อาจไม่รองรับ BroadcastChannel — ข้ามไปใช้ WS/polling แทน
  }
  return () => { try { bc?.close(); } catch {} };
}, []);
useEffect(() => {
  const total = patients.filter((p) => p.id && p.id !== 0).length;
  setStats((prev) =>
    prev.map((s) =>
      s.title === "Total Patients"
        ? { ...s, value: total.toLocaleString("en-US"), subtitle: "updated just now" }
        : s
    )
  );
}, [patients]);

useEffect(() => {
  console.log("psychologist_id =", id); // ✅ debug

  if (id) {
    fetch(`http://localhost:8000/patients-by-psych?psychologist_id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then((data) => {
  if (!Array.isArray(data)) throw new Error("ข้อมูลผิดรูปแบบ");
  setPatients(data);
  setLoading(false);

  // ✅ อัปเดต Total Patients จากจำนวนผู้ป่วยจริง
  const total = data.filter((p: Patient) => p.id && p.id !== 0).length;
  setStats((prev) =>
    prev.map((s) =>
      s.title === "Total Patients"
        ? {
            ...s,
            value: total.toLocaleString("en-US"),
            subtitle: "updated just now",
          }
        : s
    )
  );
})

      .catch((err) => {
        console.error("โหลดผู้ป่วยล้มเหลว", err);

        // ✅ mock ข้อมูลไว้แสดง
        setPatients([
          {
            first_name: "-",
            last_name: "-",
            age: "-",
            gender: "-",
            birthday: "-",
            id: 0
          },
        ]);
        setLoading(false);
      });
  }
}, [id]);
useEffect(() => {
  if (!id) return;
  let isUnmounted = false;

  const refetchPatients = async () => {
    try {
      const res = await fetch(`http://localhost:8000/patients-by-psych?psychologist_id=${id}`);
      if (!res.ok) throw new Error("ไม่พบข้อมูล");
      const data = await res.json();
      if (!Array.isArray(data) || isUnmounted) return;

      setPatients(data);

      const total = data.filter((p: Patient) => p.id && p.id !== 0).length;
      setStats((prev) =>
        prev.map((s) =>
          s.title === "Total Patients"
            ? {
                ...s,
                value: total.toLocaleString("en-US"),
                subtitle: "updated just now",
              }
            : s
        )
      );
    } catch (e) {
      console.error("refetch patients failed", e);
    }
  };

  try {
    const bc = new BroadcastChannel("patient_updates");
    bc.onmessage = (ev) => {
      const msg = ev.data;
      if (
        msg?.type === "patient_registered" &&
        String(msg.psychologist_id) === String(id)
      ) {

        refetchPatients();
      }
    };
    return () => {
      bc.close();
      isUnmounted = true;
    };
  } catch {
  }
}, [id]);

useEffect(() => {
  if (!id) return;

  const tokenType = localStorage.getItem("token_type") || "Bearer";
  const token = localStorage.getItem("token") || "";
  const url = `http://localhost:8000/appointments/by-psychologist?psychologist_id=${id}&include_rejected=1`;

  fetch(url, { headers: { Authorization: `${tokenType} ${token}` } })
    .then((res) => {
      if (!res.ok) throw new Error("โหลดนัดหมายล้มเหลว");
      return res.json();
    })
    .then((data) => {
      const normalize = (s?: string) =>
        String(s || "pending").toLowerCase() as "pending" | "accepted" | "rejected";

      const loaded: CalendarEvent[] = (Array.isArray(data) ? data : []).map((item: any) => ({
        id: item.id,
        title: item.title,
        detail: item.detail,
        start: new Date(item.start_time),
        end: new Date(item.end_time),
        status: normalize(item.status),
      }));

      // 🔐 รวมกับของเดิม เพื่อกันกรณี backend ไม่ส่ง rejected
      setEvents((prev) => {
        const prevById = new Map(prev.map((e) => [e.id, e]));
        const loadedById = new Map(loaded.map((e) => [e.id, e]));
        const allIds = new Set([...prevById.keys(), ...loadedById.keys()]);
        const merged: CalendarEvent[] = [];
        for (const id of allIds) {
          merged.push(loadedById.get(id) ?? prevById.get(id)!);
        }
        saveEventsToLocal(merged);
        return merged;
      });
    })
    .catch((err) => {
      console.error("โหลดนัดหมายล้มเหลว", err);
    });
}, [id]);

useEffect(() => {
  // ใช้ ws_uid ที่เซ็ตตอน login (แนะนำให้เซ็ตไว้แล้วใน SignInPages)
  const wsUid =
    localStorage.getItem("ws_uid") ||
    `d:${localStorage.getItem("psych_id") || localStorage.getItem("id") || ""}`;

  if (!wsUid) return;

  const ws = new WebSocket(`ws://localhost:8000/ws/${encodeURIComponent(wsUid)}`);
  ws.onopen = () => console.log("✅ WS psych connected:", wsUid);

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);

      if (msg.type === "appointment_status_changed") {
        const newStatus = String(msg.status || "pending").toLowerCase() as
          "pending" | "accepted" | "rejected";

        setEvents((prev) => {
          const updated = prev.map((e) =>
            e.id === Number(msg.appointment_id) ? { ...e, status: newStatus } : e
          );
          saveEventsToLocal(updated);
          return updated;
        });

        
        //refetchAppointments();
      }
    } catch {}
  };

  return () => ws.close();
}, []);

// helper ดึงข้อมูลจากฐานข้อมูล (เรียกใช้ซ้ำได้)
const refetchAppointments = async () => {
  const psychId = localStorage.getItem("id");
  if (!psychId) return;

  try {
    const tokenType = localStorage.getItem("token_type") || "Bearer";
    const token = localStorage.getItem("token") || "";

    // ถ้า backend รองรับการขอรวม rejected ด้วย ให้ใช้พารามิเตอร์นี้
    const url = `http://localhost:8000/appointments/by-psychologist?psychologist_id=${psychId}&include_rejected=1`;

    const res = await fetch(url, {
      headers: { Authorization: `${tokenType} ${token}` },
    });

    if (!res.ok) throw new Error("reload failed");
    const data = await res.json();

    const normalize = (s?: string) =>
      String(s || "pending").toLowerCase() as "pending" | "accepted" | "rejected";

    const loaded: CalendarEvent[] = (Array.isArray(data) ? data : []).map((item: any) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      start: new Date(item.start_time),
      end: new Date(item.end_time),
      status: normalize(item.status),
    }));

    // ⬇️ สำคัญ: รวมกับของเดิม เพื่อกันกรณี backend ไม่ส่ง rejected กลับมา
    setEvents((prev) => {
      const prevById = new Map(prev.map((e) => [e.id, e]));
      const loadedById = new Map(loaded.map((e) => [e.id, e]));

      const allIds = new Set([...prevById.keys(), ...loadedById.keys()]);
      const merged: CalendarEvent[] = [];

      for (const id of allIds) {
        const fromLoaded = loadedById.get(id);
        const fromPrev = prevById.get(id);
        // ถ้าโหลดมาได้ ใช้อันที่โหลด (ถือเป็น truth source)
        // ถ้าโหลดมาไม่ได้ (เช่น rejected ไม่ถูกส่ง) ให้คงอันเดิมไว้
        merged.push((fromLoaded ?? fromPrev)!);
      }

      // เซฟลง localStorage
      saveEventsToLocal(merged);
      return merged;
    });
  } catch (e) {
    console.error("refetchAppointments error", e);
  }
};

// รีเฟรชเมื่อหน้าโฟกัสกลับมา
useEffect(() => {
  const onVisible = () => {
    if (document.visibilityState === "visible") {
      refetchAppointments();
    }
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => document.removeEventListener("visibilitychange", onVisible);
}, []);


// polling ทุก 30–60 วิ (เบา ๆ)
useEffect(() => {
  const t = setInterval(refetchAppointments, 30000);
  return () => clearInterval(t);
}, []);

useEffect(() => {
  if (!id || !isLogin || role !== "Psychologist") {
    Swal.fire({
      icon: "warning",
      title: "กรุณาเข้าสู่ระบบด้วยบัญชีนักจิตวิทยา",
    }).then(() => navigate("/"));
    return;
  }
}, [id, isLogin, role]); // เพิ่ม dependency เพื่อป้องกันปัญหาดึงค่าช้า
// ✅ โหลดนัดหมายจาก localStorage ถ้ามี
/*useEffect(() => {
  const loadEventsFromStorage = () => {
    const savedEvents = localStorage.getItem(CAL_KEY); // ⬅️ แทนที่ "calendar_events"

    if (savedEvents) {
      try {
        const parsed = JSON.parse(savedEvents);
        const eventsFromStorage = parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(eventsFromStorage); // ✅ โหลดใหม่เมื่อ localStorage เปลี่ยน
      } catch (err) {
        console.error("โหลด events จาก localStorage ผิดพลาด", err);
      }
    }
  };

  // ✅ โหลดครั้งแรก
  loadEventsFromStorage();

  // ✅ โหลดใหม่เมื่อ WebSocket ส่ง Event
  window.addEventListener("calendarEventsUpdated", loadEventsFromStorage);

  return () => {
    window.removeEventListener("calendarEventsUpdated", loadEventsFromStorage);
  };
},  [CAL_KEY]); */



const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
 const patientOptions = patients.map(
  (p, idx) => `<option value="${idx}">${p.first_name} ${p.last_name}</option>`
).join("");
  const defaultStartTime = start.toTimeString().slice(0, 5); // "HH:MM"
  const defaultEndTime = end.toTimeString().slice(0, 5);     // "HH:MM"

 const { value: formValues } = await Swal.fire({
  title: "สร้างนัดหมายใหม่",
  html: `
  <div style="text-align: left; width: 100%;">

    <div style="margin-bottom: 1rem;">
      <label for="patientSelect">เลือกผู้ป่วย</label><br/>
      <select
        id="patientSelect"
        class="swal2-input"
        style="width: 50%; text-align: left; display: block; margin-left: 0;"
      >
        ${patientOptions}
      </select>
    </div>

    <div style="margin-bottom: 1rem;">
      <label for="startTime">เวลาเริ่มต้น</label><br/>
      <input
        type="time"
        id="startTime"
        class="swal2-input"
        style="width: 50%; display: block; margin-left: 0;"
        value="${defaultStartTime}"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <label for="endTime">เวลาสิ้นสุด</label><br/>
      <input
        type="time"
        id="endTime"
        class="swal2-input"
        style="width: 50%; display: block; margin-left: 0;"
        value="${defaultEndTime}"
      />
    </div>

    <div style="margin-bottom: 1rem;">
      <label for="appointmentDetail">รายละเอียดการนัด</label><br/>
      <input
        id="appointmentDetail"
        class="swal2-input"
        style="width: 50%; display: block; margin-left: 0;"
        placeholder="---"
      />
    </div>

  </div>
  `,

    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "บันทึกนัดหมาย",
   preConfirm: () => {
  const selectedPatientIndex = (document.getElementById("patientSelect") as HTMLSelectElement)?.value;
  const startTimeStr = (document.getElementById("startTime") as HTMLInputElement)?.value;
  const endTimeStr = (document.getElementById("endTime") as HTMLInputElement)?.value;
  const detail = (document.getElementById("appointmentDetail") as HTMLInputElement)?.value;

  if (!detail || !startTimeStr || !endTimeStr) {
    Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    return;
  }

  const selectedDate = new Date(start);
  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);

  const startTime = new Date(selectedDate);
  startTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(selectedDate);
  endTime.setHours(endHour, endMinute, 0, 0);

  if (endTime <= startTime) {
    Swal.showValidationMessage("เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น");
    return;
  }

  // ✅ ตรวจสอบเวลาซ้ำ
  const isConflict = events.some((ev) => {
    const existingStart = new Date(ev.start);
    const existingEnd = new Date(ev.end);

    // เงื่อนไขเวลาซ้อน: ถ้าเวลาเริ่มใหม่ < เวลาเก่าที่จบ && เวลาใหม่ที่จบ > เวลาเก่าที่เริ่ม
    return (
      selectedDate.toDateString() === existingStart.toDateString() &&
      startTime < existingEnd &&
      endTime > existingStart
    );
  });

  if (isConflict) {
    Swal.showValidationMessage("ช่วงเวลานี้มีนัดหมายอยู่แล้ว โปรดเลือกเวลาอื่น");
    return;
  }

  return { selectedPatientIndex, startTime, endTime, detail };
}

  });
if (formValues) {
  const selectedPatient = patients[Number(formValues.selectedPatientIndex)];
  const newEvent: CalendarEvent = {
  id: 0,
  title: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
  start: formValues.startTime,
  end: formValues.endTime,
  detail: formValues.detail, // ✅ เพิ่ม detail
  patientIndex: Number(formValues.selectedPatientIndex),
  status: "pending",
};


  try {
    const res = await fetch("http://localhost:8000/appointments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`, // ✅ ใส่ token
      },
      body: JSON.stringify({
        title: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        patient_id: selectedPatient.id,
        psychologist_id: Number(id), 
        start: formValues.startTime.toISOString(),
        end: formValues.endTime.toISOString(),
        detail: formValues.detail,
        status: "pending",
      }),
    });

   if (!res.ok) throw new Error("การสร้างนัดหมายล้มเหลว");

const resData = await res.json(); // ✅ รับ id กลับจาก backend

const createdEvent: CalendarEvent = {
  ...newEvent,
  id: resData.id, // ✅ เพิ่ม id ที่ backend ส่งกลับมา
};
    
setEvents((prev) => {
    const updated = [...prev, createdEvent];
     saveEventsToLocal(updated);
 // ⬅️ แทนที่
    return updated;
  });// ✅ เพิ่มนัดใหม่พร้อม id
Swal.fire("สร้างนัดหมายสำเร็จ", "", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสร้างนัดหมายได้", "error");
  }
}
};


const doneSet = useMemo(() => new Set(completedIds), [completedIds]);
const inSet   = useMemo(() => new Set(inTreatmentIds), [inTreatmentIds]);

const doneCount = useMemo(
  () => patients.filter(p => doneSet.has(p.id)).length,
  [patients, doneSet]
);

const inCount = useMemo(
  () => patients.filter(p => inSet.has(p.id) && !doneSet.has(p.id)).length,
  [patients, inSet, doneSet]
);

// ผู้ป่วยใหม่ = ทั้งหมด - (กำลังรักษา + เสร็จสิ้น)
// กันค่าติดลบไว้ด้วย
const newCount = Math.max(0, patients.length - doneCount - inCount);
// เดิม: เปิด popup รายการเดียว และถามจะลบ/เลื่อน
// ใหม่: เปิด “ลิสต์นัดหมายของวันนั้นทั้งหมด”
const handleSelectEvent = (event: { start: Date }) => {
  openDayAppointments(new Date(event.start));
};

// ✅ ช่วยฟอร์แมตเวลาเป็น HH:mm
const fmt = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

// ✅ เช็คว่าเป็นวันเดียวกัน (ไม่สนเวลา)
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// ✅ เปิดลิสต์นัดหมายทั้งหมดของวันเป้าหมาย พร้อมปุ่มจัดการทีละรายการ
const openDayAppointments = (targetDate: Date) => {
  const dayEvents = events
    .filter(e => isSameDay(new Date(e.start), targetDate))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));

  if (dayEvents.length === 0) {
    Swal.fire("ไม่มีนัดหมายในวันนี้", "", "info");
    return;
  }

  const htmlList = dayEvents.map(ev => {
    const rescheduled = (ev as any).rescheduled && ev.oldStart && ev.oldEnd; 
    const color =
      (ev.status ?? "pending") === "accepted" ? "#10b981" :
      (ev.status ?? "pending") === "rejected" ? "#ef4444" :
      "#f59e0b";
    const statusText = rescheduled ? "เปลี่ยนเวลานัดเรียบร้อยแล้ว" : (ev.status ?? "pending");
    const statusColor = rescheduled ? "#d97706" : color;
    return `
      <div style="
  border:1px solid ${rescheduled ? statusColor : '#eee'}; border-left:6px solid ${statusColor};
  border-radius:10px; padding:10px 12px; margin-bottom:10px;
">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
          <div style="min-width:0;">
            <div style="font-weight:600; font-size:14px;">${ev.title || "-"}</div>
            <div style="font-size:12px; color:#666; margin-top:2px;">
              ${fmt(new Date(ev.start))}–${fmt(new Date(ev.end))}
              ${ev.detail ? ` · ${ev.detail}` : ""}
            </div>
         <div style="font-size:12px; margin-top:2px;">
  สถานะ: <span style="font-weight:600; color:${statusColor};">${statusText}</span>
</div>
${rescheduled
  ? `<div style="font-size:12px;color:#9CA3AF;margin-top:2px">
       เดิม: <s>${fmt(new Date(ev.oldStart as any))}–${fmt(new Date(ev.oldEnd as any))}</s>
     </div>`
  : ``}
          </div>
          <div style="flex:0 0 auto; display:flex; gap:6px;">
          <button class="swal2-confirm qewty-apt-reschedule" data-id="${ev.id}"
  style="padding:6px 10px; font-size:12px;">
  เลื่อนเวลา
</button>
<button class="swal2-deny qewty-apt-delete" data-id="${ev.id}"
  style="padding:6px 10px; font-size:12px;">
  ลบ
</button>

          </div>
        </div>
      </div>
    `;
  }).join("");

  Swal.fire({
    title: `นัดหมายในวันนี้ (${dayEvents.length})`,
    html: `<div style="text-align:left; max-height:60vh; overflow:auto;">${htmlList}</div>`,
    showConfirmButton: true,
    confirmButtonText: "ปิด",
    didOpen: () => {
      // ลบ
      document.querySelectorAll<HTMLButtonElement>(".qewty-apt-delete").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.dataset.id);
          if (!id || Number.isNaN(id)) {
            Swal.fire("เกิดข้อผิดพลาด", "ไม่พบรหัสนัดหมาย (ID)", "error");
            return;
          }
          const ok = await Swal.fire({
            title: "ยืนยันการลบ",
            text: "คุณต้องการลบนัดหมายนี้หรือไม่?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
          });
          if (!ok.isConfirmed) return;

          try {
            const res = await fetch(`http://localhost:8000/appointments/${id}`, {
              method: "DELETE",
              headers: {
                Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
              },
            });
            if (!res.ok) throw new Error("delete failed");

            setEvents(prev => {
              const updated = prev.filter(e => e.id !== id);
              saveEventsToLocal(updated);
              return updated;
            });

            Swal.fire("ลบนัดหมายแล้ว", "", "success").then(() => {
              openDayAppointments(targetDate); // refresh ลิสต์วันนั้น
            });
          } catch (e) {
            console.error(e);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบนัดหมายได้", "error");
          }
        });
      });

      // เลื่อน
      document.querySelectorAll<HTMLButtonElement>(".qewty-apt-reschedule").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = Number(btn.dataset.id);
          const ev = events.find(x => x.id === id);
          if (!ev) {
            Swal.fire("เกิดข้อผิดพลาด", "ไม่พบนัดหมาย", "error");
            return;
          }
          const startTime = ev.start instanceof Date ? ev.start : new Date(ev.start);
          const endTime = ev.end instanceof Date ? ev.end : new Date(ev.end);

          const { value: newTimes } = await Swal.fire({
            title: "เลื่อนเวลานัดหมาย",
            html: `
              <div style="text-align:left;">
                <div style="margin-bottom:8px;">
                  <label>เวลาเริ่มต้นใหม่</label><br/>
                  <input id="startTime" type="time" class="swal2-input" style="width:60%;"
                    value="${fmt(startTime)}">
                </div>
                <div>
                  <label>เวลาสิ้นสุดใหม่</label><br/>
                  <input id="endTime" type="time" class="swal2-input" style="width:60%;"
                    value="${fmt(endTime)}">
                </div>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: "บันทึก",
            preConfirm: () => {
              const startStr = (document.getElementById("startTime") as HTMLInputElement)?.value;
              const endStr = (document.getElementById("endTime") as HTMLInputElement)?.value;
              if (!startStr || !endStr) {
                Swal.showValidationMessage("กรุณากรอกเวลาให้ครบ");
                return;
              }
              const [sh, sm] = startStr.split(":").map(Number);
              const [eh, em] = endStr.split(":").map(Number);

              const base = new Date(ev.start);
              const ns = new Date(base); ns.setHours(sh, sm, 0, 0);
              const ne = new Date(base); ne.setHours(eh, em, 0, 0);

              if (ne <= ns) {
                Swal.showValidationMessage("เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น");
                return;
              }
              const conflict = events.some(other => {
                if (other.id === ev.id) return false;
                return isSameDay(new Date(other.start), ns) &&
                       ns < new Date(other.end) &&
                       ne > new Date(other.start);
              });
              if (conflict) {
                Swal.showValidationMessage("ช่วงเวลานี้มีนัดหมายอยู่แล้ว");
                return;
              }
              return { ns, ne };
            }
          });

          if (!newTimes) return;

          try {
            const res = await fetch(`http://localhost:8000/appointments/update-time`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                id: ev.id,
                new_start: newTimes.ns.toISOString(),
                new_end: newTimes.ne.toISOString(),
                title: ev.title,
                detail: ev.detail || "---",
              }),
            });
            if (!res.ok) throw new Error("update failed");

            setEvents(prev => {
              const updated = prev.map(x =>
                x.id === ev.id ? { ...x, start: newTimes.ns, end: newTimes.ne, rescheduled: true,
          oldStart: startTime,
          oldEnd: endTime, } : x
              );
              saveEventsToLocal(updated);
              return updated;
            });

            Swal.fire("เลื่อนนัดหมายเรียบร้อย", "", "success").then(() => {
              openDayAppointments(targetDate); // refresh ลิสต์วันนั้น
            });
          } catch (e) {
            console.error(e);
            Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเลื่อนเวลานัดหมายได้", "error");
          }
        });
      });
    },
  });
};




  return (
  <div className="qewty-stats-container">
      {stats.map((stat, index) => (
        <div key={index} className="qewty-stat-card">
          <div className="qewty-stat-header">
            <h4>{stat.title}</h4>
            <img src={stat.icon} alt="icon" className="qewty-stat-icon" />
          </div>
          <div className="qewty-stat-main">
            <span className="qewty-stat-value">{stat.value}</span>
            <p className="qewty-stat-sub">{stat.subtitle}</p>
          </div>
        </div>
      ))}
   {/* Left Chart Section */}
<div className="qewty-chart-section">
  <h3 className="qewty-chart-title">Patient Overview</h3>
  <p className="qewty-chart-subtitle">Quick insights into your patient base.</p>

 <div className="qewty-barchart-holder">
  <PatientOverviewChart
    patients={patients}
    inTreatmentIds={inTreatmentIds}
    completedIds={completedIds}
  />


    <div className="qewty-status-overlay">
  <h4 className="qewty-status-title">
    Patient Status <span className="qewty-status-right">จำนวน</span>
  </h4>
  <ul className="qewty-status-list">
    <li>
      <span className="qewty-status-left">ผู้ป่วยบำบัดเรียบร้อยแล้ว :</span>
      <span className="qewty-status-right">
        <strong>{doneCount.toLocaleString()} คน</strong>
      </span>
    </li>
    <li>
      <span className="qewty-status-left">ผู้ป่วยที่รักษาอยู่ :</span>
      <span className="qewty-status-right">
        <strong>{inCount.toLocaleString()} คน</strong>
      </span>
    </li>
    <li>
      <span className="qewty-status-left">ผู้ป่วยใหม่ :</span>
      <span className="qewty-status-right">
        <strong>{newCount.toLocaleString()} คน</strong>
      </span>
    </li>
  </ul>

  <button className="qewty-overlay-btn">View More Information</button>
</div>

  </div>
</div>


    {/* Right Feedback Section */}
<div className="qewty-feedback-section">
  <div className="qewty-feedback-card">
    <h4>Feedback Thought Record</h4>
    <p className="qewty-subtext">Recent feedback on thought records.</p>
    <p>
      <strong>Patient I - Feedback (2025-08-02)</strong><br />
      "Identifying automatic thoughts has been a game-changer for me."
    </p>
    <p>
      <strong>Patient J - Feedback (2025-08-01)</strong><br />
      "The alternative thoughts section helps me reframe negative thinking."
    </p>
    <button className="qewty-feedback-btn">View More</button>
  </div>

  <div className="qewty-feedback-card">
    <h4>Feedback Diary</h4>
    <p className="qewty-subtext">Recent feedback from patient diary entries.</p>
    <p>
      <strong>Patient G - Feedback (2025-08-04)</strong><br />
      "The journaling prompts were very helpful in processing my emotions."
    </p>
    <p>
      <strong>Patient H - Feedback (2025-08-03)</strong><br />
      "I appreciate the space to reflect on my day without judgment."
    </p>
    <button className="qewty-feedback-btn">View More</button>
  </div>
</div>
{/* Emotion Distribution Section */}
<div className="qewty-emotion-distribution">
  <div className="qewty-emotion-header">
    <h4>🕒 Emotion Distribution from Thought Records</h4>
    <div className="qewty-emotion-filters">
      <select>
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
      </select>
      <select>
        <option>All Patients</option>
        <option>Patient A</option>
        <option>Patient B</option>
      </select>
    </div>
  </div>

  <p className="qewty-emotion-subtext">
    Breakdown of emotions identified in patient thought record entries, filtered by time and patient.
  </p>

  {/* Pie Chart Placeholder */}
  <div className="qewty-piechart-holder">
    [Pie Chart Placeholder]
  </div>

  {/* Legend */}
  <div className="qewty-emotion-legend">
    <span className="legend-item anxiety">🔴 Anxiety</span>
    <span className="legend-item sadness">🌸 Sadness</span>
    <span className="legend-item anger">🟧 Anger</span>
    <span className="legend-item joy">🟩 Joy</span>
    <span className="legend-item neutral">🟨 Neutral</span>
  </div>
</div>
<div className="qewty-appointment-resources">
 <div className="docflour-card">
  <h3>ตารางนัดหมาย</h3>
  <div className="docflour-calendar-container">
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      date={calendarDate}
      onNavigate={(date) => setCalendarDate(date)}
      components={{
        toolbar: (props: any) => (
          <Customcalendar {...props} date={calendarDate} setDate={setCalendarDate} />
        ),
      }}
      selectable
      onSelectSlot={handleSelectSlot}
      onSelectEvent={handleSelectEvent}
      style={{ height: "100%", borderRadius: "8px", padding: "8px" }}
      eventPropGetter={(event: CalendarEvent) => {
        const status = event.status ?? "pending";
        let backgroundColor = "#facc15";
        if (status === "accepted") backgroundColor = "#10b981";
        if (status === "rejected") backgroundColor = "#ef4444";

        return {
          style: {
            backgroundColor,
            borderRadius: "6px",
            color: "#fff",
            padding: "4px 8px",
            fontSize: "0.75rem",
          },
        };
      }}
    />
  </div>
</div>


{/* Right: Resource */}
<div className="qewty-resource-card">
  <h4 className="qewty-resource-title">Resource Recommendations</h4>

  <div className="qewty-resource-item">
    <strong>Book: "Feeling Good" by David D. Burns</strong>
    <p className="qewty-subtext">Recommended for Patient N (CBT focus)</p>
  </div>

  <div className="qewty-resource-item">
    <strong>Meditation App: Calm</strong>
    <p className="qewty-subtext">Suggested for Patient O (Stress management)</p>
  </div>

  <div className="qewty-resource-item">
    <strong>Research Article:</strong>
    <p className="qewty-subtext">
      <a 
        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3584580/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Cognitive Behavioral Therapy for Depression: A Review of Its Efficacy
      </a>
    </p>
  </div>

  <div className="qewty-resource-item">
    <strong>Therapy Manual (CBT for Psychologists)</strong>
    <p className="qewty-subtext">
      <a 
        href="https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral"
        target="_blank"
        rel="noopener noreferrer"
      >
        APA CBT Treatment Guide
      </a>
    </p>
  </div>

  <div className="qewty-resource-item">
    <strong>Patient Mood & Behavior Patterns</strong>
    <p className="qewty-subtext">
      <a 
        href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5919646/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Understanding Mood and Behavioral Changes in Patients
      </a>
    </p>
  </div>
</div>

</div>



    </div>
  );
};


export default Homedoc;