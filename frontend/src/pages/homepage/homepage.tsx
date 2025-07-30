import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./HomePage.css";
import DiarySummary from "../diary_summary/DiarySummary";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";
//import pamemo1 from "../assets/pamemo1.png"; // ปรับ path ให้ถูกต้องตามโปรเจกต์คุณ

function HomePage() {
type ChecklistType = {
  diary: boolean;
  thoughtRecord: boolean;
};

const defaultChecklist: ChecklistType = { diary: false, thoughtRecord: false };
const TOTAL_DAYS = 7;

const [checklist, setChecklist] = useState<ChecklistType>(defaultChecklist);
const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);

// โหลดจาก localStorage หรือเซ็ตค่าเริ่มต้น
useEffect(() => {
  const id = localStorage.getItem("id");
  if (!id) return;

  const today = new Date().toLocaleDateString("th-TH");

  const checklistKey = `checklist-${id}-${today}`;
  const checklistDayIndexKey = `checklistDayIndex-${id}`;
  const checklistDateKey = `checklistDate-${id}`;

  const storedChecklist = localStorage.getItem(checklistKey);
  const storedDate = localStorage.getItem(checklistDateKey);
  const storedDayIndex = localStorage.getItem(checklistDayIndexKey);

  if (!storedDayIndex || !storedDate) {
    localStorage.setItem(checklistDayIndexKey, "0");
    localStorage.setItem(checklistDateKey, today);
    localStorage.setItem(checklistKey, JSON.stringify(defaultChecklist));
    setChecklist(defaultChecklist);
    setCurrentDayIndex(0);
  } else if (storedDate !== today) {
    const lastIndex = Number(storedDayIndex);
    const nextIndex = (lastIndex + 1) % TOTAL_DAYS;

    localStorage.setItem(checklistDayIndexKey, nextIndex.toString());
    localStorage.setItem(checklistDateKey, today);
    localStorage.setItem(checklistKey, JSON.stringify(defaultChecklist));
    setChecklist(defaultChecklist);
    setCurrentDayIndex(nextIndex);
  } else if (storedChecklist) {
    setChecklist(JSON.parse(storedChecklist));
    setCurrentDayIndex(Number(storedDayIndex));
  }
}, []);




const toggleCheck = (key: keyof ChecklistType) => {
  const id = localStorage.getItem("id");
  const today = new Date().toLocaleDateString("th-TH");
  const checklistKey = `checklist-${id}-${today}`;

  const updated = { ...checklist, [key]: true };
  setChecklist(updated);
  localStorage.setItem(checklistKey, JSON.stringify(updated));
};

const DAILY_TASKS: { diary: string; thoughtRecord: string }[] = [
  {
    diary: "จดบันทึก DIARY",
    thoughtRecord: "ทำ THOUGHT RECORD",
  },
  {
    diary: "บันทึกอารมณ์ประจำวัน",
    thoughtRecord: "สะท้อนความคิดวันนี้",
  },
  {
    diary: "เล่าเหตุการณ์สำคัญ",
    thoughtRecord: "จับความคิดเชิงลบ",
  },
  {
    diary: "วันนี้เจออะไรบ้าง?",
    thoughtRecord: "วิเคราะห์อารมณ์",
  },
  {
    diary: "บันทึกสิ่งดี ๆ ที่เกิดขึ้น",
    thoughtRecord: "เทคนิคที่ช่วยได้",
  },
  {
    diary: "มุมมองใหม่ในวันนี้",
    thoughtRecord: "วิเคราะห์พฤติกรรม",
  },
  {
    diary: "สรุปภาพรวมทั้งสัปดาห์",
    thoughtRecord: "สรุปการเปลี่ยนแปลงในตัวเอง",
  },
];

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
    //const loginHistoryKey = `loginHistory-${email}`;
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
    setNextAppointmentText(`${startDate} ${startTime}–${endTime} น.`);
  }
}, []);
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
    <>
      {/* ส่วนบน: การ์ด potatopsy */}
      <div className="potatopsy-cards">
        {/* จำนวนเข้าใช้ระบบ */}
      {/* Checklist Card */}
  <div className="potatopsy-card turquoise">
  <div className="checklist-card">
    <h3 className="checklist-title">
      Checklist
      <img
        src="https://cdn-icons-png.flaticon.com/128/2666/2666505.png"
        alt="checklist"
        className="checklist-icon"
      />
    </h3>
    <div className="checklist-items">
      <div className="checklist-item" onClick={() => toggleCheck("diary")}>
  <img
    src={
      checklist.diary
        ? "https://cdn-icons-png.flaticon.com/128/9249/9249233.png"
        : "https://cdn-icons-png.flaticon.com/128/3515/3515278.png"
    }
    alt="checkbox"
    className="check-icon"
  />
  <span>{DAILY_TASKS[currentDayIndex].diary}</span>
</div>

<div className="checklist-item" onClick={() => toggleCheck("thoughtRecord")}>
  <img
    src={
      checklist.thoughtRecord
        ? "https://cdn-icons-png.flaticon.com/128/9249/9249233.png"
        : "https://cdn-icons-png.flaticon.com/128/3515/3515278.png"
    }
    alt="checkbox"
    className="check-icon"
  />
  <span>{DAILY_TASKS[currentDayIndex].thoughtRecord}</span>
</div>

    </div>
  </div>
</div>


        {/* เวลา */}
       <div
  className="potatopsy-card blue clickable-card"
  onClick={handleShowAppointments}
>
  <div style={{ width: "100%", textAlign: "center" }}>
    <h3 style={{ fontSize: "1.5rem", margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
  <img
    src="https://cdn-icons-png.flaticon.com/128/16950/16950690.png"
    alt="appointment"
    width="28"
    style={{ verticalAlign: "middle" }}
  />
  ข้อมูลนัดหมาย
</h3>

  </div>
</div>


        {/* วันที่ */}
        <div className="potatopsy-card pink">
          <div className="potatopsy-card-left">
            <div className="potatopsy-card-icon-wrapper">
              <img
                src="https://cdn-icons-png.flaticon.com/128/12887/12887924.png"
                alt="calendar"
              />
            </div>
            <p>วันที่</p>
          </div>
          <div className="potatopsy-card-right">
            <h3>นัดหมายที่จะถึงเร็วๆนี้</h3>
            <span>{nextAppointmentText}</span>
          </div>
        </div>
      </div>

      <div className="billyboy-grid">
        {/* แถวบน: 2 ช่อง */}
        <div className="billyboy-row billyboy-two-cols">
          <div className="billyboy-card billyboy-big">
            <h3>Feedback (Diary)</h3>
          </div>
          <div className="billyboy-card billyboy-big">
            <h3>Feedback (Thought Record)</h3>
          </div>
        </div>

        {/* แถวกลาง: 1 ช่องเต็ม */}
        <DiarySummary/>

        {/* แถวล่าง: 1 ช่องเต็ม */}
        <div className="billyboy-row">
          <div className="billyboy-card billyboy-wide">
            <h3>สรุปอารมณ์ (Thought Record)</h3>
          </div>
        </div>
      </div>
    </>
  );
}
export default HomePage;
