import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { th, enUS } from "date-fns/locale";
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
}
const Homedoc: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");
  const id = localStorage.getItem("id");
  const [loading, setLoading] = useState(true); // ✅ โหลดสถานะ
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
const [searchTerm, setSearchTerm] = useState("");

const filteredPatients = patients.filter((p) => {
  const fullText = `${p.first_name} ${p.last_name} ${p.gender} ${p.age} ${p.birthday}`.toLowerCase();

  return fullText.includes(searchTerm.toLowerCase());
});

interface Patient {
  id: number; // ✅ เพิ่มบรรทัดนี้
  first_name: string;
  last_name: string;
  age: number | string;
  gender: string;
  birthday: string;
}

useEffect(() => {
  console.log("psychologist_id =", id); // ✅ debug

  if (id) {
    fetch(`http://localhost:8000/patients-by-psych?psychologist_id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("ข้อมูลผิดรูปแบบ"); // ✅ ป้องกัน crash
        setPatients(data);
        setLoading(false); // ✅ ปิด loading
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
// ✅ ใส่ต่อท้าย useEffect ด้านบน
useEffect(() => {
  if (!id) return;

  fetch(`http://localhost:8000/appointments/by-psychologist?psychologist_id=${id}`)
    .then((res) => {
      if (!res.ok) throw new Error("โหลดนัดหมายล้มเหลว");
      return res.json();
    })
    .then((data) => {
   const loadedEvents = data.map((item: { id: any; title: any; detail: any; start_time: string | number | Date; end_time: string | number | Date; }) => ({
  id: item.id, // ✅ สำคัญ! เพื่อให้สามารถส่ง id กลับไปตอนอัปเดตได้
  title: item.title,
  detail: item.detail,
  start: new Date(item.start_time),
  end: new Date(item.end_time),
}));

setEvents(loadedEvents);
      localStorage.setItem("calendar_events", JSON.stringify(loadedEvents));

    })
    .catch((err) => {
      console.error("โหลดนัดหมายล้มเหลว", err);
    });
}, [id]);

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
useEffect(() => {
  const savedEvents = localStorage.getItem("calendar_events");
  if (savedEvents) {
    try {
      const parsed = JSON.parse(savedEvents);
      const eventsFromStorage = parsed.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
      setEvents(eventsFromStorage);
    } catch (err) {
      console.error("โหลด events จาก localStorage ผิดพลาด", err);
    }
  }
}, []);


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
    localStorage.setItem("calendar_events", JSON.stringify(updated));
    return updated;
  });// ✅ เพิ่มนัดใหม่พร้อม id
Swal.fire("สร้างนัดหมายสำเร็จ", "", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสร้างนัดหมายได้", "error");
  }
}
};




const handleSelectEvent = (event: {
  detail: string; id: number; title: string; start: Date; end: Date 
}) => {
  Swal.fire({
    title: `นัดหมาย: ${event.title}`,
    text: "คุณต้องการทำอะไรกับนัดหมายนี้?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "ลบ",
    denyButtonText: "เลื่อนเวลา",
  }).then(async (result) => {
    if (result.isConfirmed) {
       if (!event.id || isNaN(event.id)) {
    Swal.fire("เกิดข้อผิดพลาด", "ไม่พบรหัสนัดหมาย (ID)", "error");
    return;
  }
      try {
  const res = await fetch(`http://localhost:8000/appointments/${event.id}`, {
    method: "DELETE",
    headers: {
      Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) throw new Error("ลบนัดหมายไม่สำเร็จ");

  setEvents((prev) => {
  const updated = prev.filter((e) => e.id !== event.id);
  localStorage.setItem("calendar_events", JSON.stringify(updated));
  return updated;
});

  Swal.fire("ลบนัดหมายแล้ว", "", "success");
} catch (err) {
  console.error("ลบล้มเหลว", err);
  Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบนัดหมายได้", "error");
}


    } else if (result.isDenied) {
      const startTime = event.start.toTimeString().slice(0, 5);
      const endTime = event.end.toTimeString().slice(0, 5);

      const { value: newTimes } = await Swal.fire({
        title: "เลื่อนเวลานัดหมาย",
        html: `
          <div style="text-align: left; width: 100%;">
            <div style="margin-bottom: 1rem;">
              <label for="startTime">เวลาเริ่มต้นใหม่</label><br/>
              <input
                type="time"
                id="startTime"
                class="swal2-input"
                style="width: 50%; display: block; margin-left: 0;"
                value="${startTime}"
              />
            </div>

            <div style="margin-bottom: 1rem;">
              <label for="endTime">เวลาสิ้นสุดใหม่</label><br/>
              <input
                type="time"
                id="endTime"
                class="swal2-input"
                style="width: 50%; display: block; margin-left: 0;"
                value="${endTime}"
              />
            </div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        preConfirm: () => {
          const startStr = (document.getElementById("startTime") as HTMLInputElement)?.value;
          const endStr = (document.getElementById("endTime") as HTMLInputElement)?.value;

          if (!startStr || !endStr) {
            Swal.showValidationMessage("กรุณากรอกเวลาให้ครบ");
            return;
          }

          const selectedDate = new Date(event.start);
          const [sh, sm] = startStr.split(":").map(Number);
          const [eh, em] = endStr.split(":").map(Number);

          const newStart = new Date(selectedDate);
          newStart.setHours(sh, sm, 0, 0);

          const newEnd = new Date(selectedDate);
          newEnd.setHours(eh, em, 0, 0);

          if (newEnd <= newStart) {
            Swal.showValidationMessage("เวลาสิ้นสุดต้องหลังเวลาเริ่มต้น");
            return;
          }

          // ✅ ตรวจสอบเวลาทับซ้อนกับ event อื่น (ยกเว้นตัวเอง)
          const isConflict = events.some((ev) => {
            if (ev.id === event.id) return false;
            const existingStart = new Date(ev.start);
            const existingEnd = new Date(ev.end);

            return (
              selectedDate.toDateString() === existingStart.toDateString() &&
              newStart < existingEnd &&
              newEnd > existingStart
            );
          });

          if (isConflict) {
            Swal.showValidationMessage("ช่วงเวลานี้มีนัดหมายอยู่แล้ว โปรดเลือกเวลาอื่น");
            return;
          }

          return { newStart, newEnd };
        },
      });

      if (newTimes) {
  try {
    const res = await fetch(`http://localhost:8000/appointments/update-time`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        id: event.id, // ถ้าใช้ id ได้ จะดีกว่า!
        new_start: newTimes.newStart.toISOString(),
        new_end: newTimes.newEnd.toISOString(),
        title: event.title, // ✅ ส่งชื่อใหม่ (ถ้ามี)
        detail: event.detail || "---", // ✅ ปลอดภัยไว้ก่อน
      }),
    });

    if (!res.ok) throw new Error("อัปเดตเวลานัดหมายล้มเหลว");

  setEvents((prev) => {
  const updated = prev.map((e) =>
    e.id === event.id ? { ...e, start: newTimes.newStart, end: newTimes.newEnd } : e
  );
  localStorage.setItem("calendar_events", JSON.stringify(updated));
  return updated;
});

    Swal.fire("เลื่อนนัดหมายเรียบร้อย", "", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเลื่อนเวลานัดหมายได้", "error");
  }
}
    }
  });
};



  return (
<div className="docflour-homepage">
  <section className="docflour-grid">
    {/* กล่อง 1: Patient Case + Search */}
    <div className="docflour-card">
   
      <h3>PATIENT CASE</h3>
      <div className="docflour-search-box">
        <input
          value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="docflour-search-input"
        />
        <button className="docflour-search-button">🔍</button>
      </div>
      {loading ? (
  <p style={{ textAlign: "center", marginTop: "1rem" }}>กำลังโหลดข้อมูล...</p>
) : (
  <table className="docflour-patient-table">
    <thead>
      <tr>
        <th>ลำดับ</th>
        <th>ชื่อ</th>
        <th>นามสกุล</th>
        <th>อายุ</th>
        <th>เพศ</th>
        <th>วันเกิด</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredPatients.length > 0 ? (
        filteredPatients.map((p, idx) => (
          <tr key={idx}>
            <td>{idx + 1}</td>
            <td>{p.first_name}</td>
            <td>{p.last_name}</td>
            <td>{p.age}</td>
            <td>{p.gender}</td>
            <td>{new Date(p.birthday).toLocaleDateString("th-TH")}</td>
            <td>
              <span className="status-tag active">Active</span>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={7} style={{ textAlign: "center", padding: "1rem" }}>
            ไม่พบข้อมูลผู้ป่วย
          </td>
        </tr>
      )}
    </tbody>
  </table>
)}

    </div>

    {/* กล่อง 2: ตารางนัดหมาย */}
   {/* กล่อง 2: ตารางนัดหมาย */}
<div className="docflour-card">
  <h3>ตารางนัดหมาย</h3>
  <div
    style={{
      height: "300px",
      width: "100%",
      background: "#fff",
      borderRadius: "12px",
      marginTop: "1rem",
      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    }}
  >
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

    {/* กล่อง 3: Summary */}
    <div className="docflour-cardz">
      <h3>Summary Overview</h3>
    </div>

    {/* กล่อง 4: Feedback */}
    <div className="docflour-cardz">
      <h3>Feedback</h3>
    </div>
  </section>
</div>
    
  );
};

export default Homedoc;