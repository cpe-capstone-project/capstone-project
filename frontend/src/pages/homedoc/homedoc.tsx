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
const stats = [
  {
    title: "Total Patients",
    value: "2,350",
    subtitle: "+20.1% from last month",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747376.png", // 👥 icon
  },
  {
    title: "Upcoming Sessions",
    value: "12",
    subtitle: "5 this week",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747310.png", // 🗓️ icon
  },
  {
    title: "Recent Activities",
    value: "34",
    subtitle: "New notes added today",
    icon: "https://cdn-icons-png.flaticon.com/128/747/747327.png", // 📈 icon
  },
];
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
  const loadEventsFromStorage = () => {
    const savedEvents = localStorage.getItem("calendar_events");
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

  <div className="qewty-barchart-holder">[Bar Placeholder]


    {/* Overlay Box */}
    <div className="qewty-status-overlay">
      <h4 className="qewty-status-title">
        Patient Status <span className="qewty-status-right">จำนวน</span>
      </h4>
      <ul className="qewty-status-list">
  <li>
    <span className="qewty-status-left">ผู้ป่วยบำบัดเรียบร้อยแล้ว :</span>
    <span className="qewty-status-right"><strong>20 คน</strong></span>
  </li>
  <li>
    <span className="qewty-status-left">ผู้ป่วยที่รักษาอยู่ :</span>
    <span className="qewty-status-right"><strong>10 คน</strong></span>
  </li>
  <li>
    <span className="qewty-status-left">ผู้ป่วยใหม่ :</span>
    <span className="qewty-status-right"><strong>10 คน</strong></span>
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
  </div>
</div>



    </div>
  );
};


export default Homedoc;