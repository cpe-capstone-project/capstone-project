import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { th, enUS } from "date-fns/locale";
import Customcalendar from "../../components/customcalendar/customcalendar";
import folderdocImage from "../../assets/folderdoc.png";
import PolarAreaChart from '../../components/PolarAreaChart/PolarAreaChart';
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
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      title: "นัดหมายกับ นภัสวรรณ",
      start: new Date(),
      end: new Date(new Date().getTime() + 30 * 60000),
    },
  ]);

  useEffect(() => {
    if (!isLogin || role !== "Psychologist") {
      Swal.fire({
        icon: "warning",
        title: "คุณต้องเข้าสู่ระบบด้วยบัญชีนักจิตวิทยา",
      }).then(() => navigate("/"));
    } else {
      showNotification();
    }
  }, []);

  const showNotification = () => {
  Swal.fire({
    toast: true,
    position: "top-end",
    title: "แจ้งเตือนระบบ",
    html: `
      <div style="text-align: left; font-size: 14px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <img src="https://cdn-icons-png.flaticon.com/128/10099/10099006.png" alt="alert" 
              style="width: 20px; height: 20px; margin-right: 8px;" />
          คุณยังไม่ได้ให้คำแนะนำ <b>3 เคส</b>
        </div>
        <div style="display: flex; align-items: center;">
          <img src="https://cdn-icons-png.flaticon.com/128/4201/4201973.png" alt="warning" 
              style="width: 20px; height: 20px; margin-right: 8px;" />
          <span>พบข้อความเสี่ยงจาก <b>นภัสวรรณ</b> — ระบบประเมิน: <span style="color:red; font-weight:bold">สูง</span></span>
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "#ffffff",
    timer: 5000,
    timerProgressBar: true,
    customClass: { popup: "swal2-elegant-popup" },
  });
};


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
      {/* Welcome Header */}
      <section className="docflour-welcome-box">
        <h1>Welcome, fellow psychologist.</h1>
        <p>Let’s take care of others — and ourselves.</p>
      </section>

      {/* Search */}
      <section className="docflour-search-section">
        <input type="text" placeholder="Search by name, patient ID, or email" className="docflour-search-input" />
        <button className="docflour-search-button">🔍</button>
      </section>

      {/* Dashboard */}
      <section className="docflour-dashboard">
       <div className="docflour-card">
  <h3>Dashboard สรุปผลรวม</h3>
  <PolarAreaChart />
</div>


        {/* Calendar */}
        <div className="docflour-card">
          <h3>Appointments / การนัดหมาย</h3>
          <p>ตารางนัดหมาย</p>
          <div
            style={{
              height: "400px",
              background: "#ffffff",
              borderRadius: "10px",
              padding: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
  style={{ height: "100%", borderRadius: "8px" }}
/>

          </div>
        </div>
      </section>
      {/* Resource Sections */}
<section className="docflour-resources">
  <div className="docflour-folder">
  <img src={folderdocImage} alt="folder icon" className="docflour-folder-icon" />
  <p>แหล่งข้อมูล / Resource สำหรับนักจิต</p>
</div>
  <div className="docflour-folder">
  <img src={folderdocImage} alt="folder icon" className="docflour-folder-icon" />
  <p>บทความวิจัย / เทคนิคการให้คำปรึกษา</p>
</div>
</section>

    </div>
    
  );
};

export default Homedoc;
