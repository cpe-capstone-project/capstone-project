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
const Homedoc: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");
  const id = localStorage.getItem("id");
  const [loading, setLoading] = useState(true); // ✅ โหลดสถานะ

  const [patients, setPatients] = useState<Patient[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      title: "นัดหมายกับ นภัสวรรณ",
      start: new Date(),
      end: new Date(new Date().getTime() + 30 * 60000),
    },
  ]);
const [searchTerm, setSearchTerm] = useState("");

const filteredPatients = patients.filter((p) => {
  const fullText = `${p.first_name} ${p.last_name} ${p.gender} ${p.age} ${p.birthday}`.toLowerCase();

  return fullText.includes(searchTerm.toLowerCase());
});

interface Patient {
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
          },
        ]);
        setLoading(false);
      });
  }
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


  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    Swal.fire({
      title: "สร้างนัดหมายใหม่",
      input: "text",
      inputLabel: "ชื่อการนัดหมาย",
      showCancelButton: true,
      confirmButtonText: "สร้าง",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newEvent = { title: result.value, start, end };
        setEvents((prev) => [...prev, newEvent]);
        Swal.fire("สร้างนัดหมายสำเร็จ", "", "success");
      }
    });
  };

  const handleSelectEvent = (event: { title: string }) => {
    Swal.fire({
      title: `นัดหมาย: ${event.title}`,
      text: "คุณต้องการทำอะไรกับนัดหมายนี้?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      denyButtonText: `เลื่อนเวลา`,
    }).then((result) => {
      if (result.isConfirmed) {
        setEvents((prev) => prev.filter((e) => e.title !== event.title));
        Swal.fire("ลบนัดหมายแล้ว", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Coming Soon", "ฟีเจอร์เลื่อนนัดหมายจะพร้อมในอนาคต", "info");
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
        toolbar: (props) => (
          <Customcalendar {...props} date={calendarDate} setDate={setCalendarDate} />
        ),
      }}
      selectable
      onSelectSlot={handleSelectSlot}
      onSelectEvent={handleSelectEvent}
      style={{ height: "100%", borderRadius: "8px", padding: "8px" }}
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
