import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./HomePage.css";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";


function HomePage() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
 // const [latestDiaries, setLatestDiaries] = useState<DiaryInterface[]>([]);
useEffect(() => {
  showSuccessLog(); // <--- เพิ่มเพื่อทดสอบ
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

  const checklistSets = [
  [ // Day 1
    "จดบันทึกไดอารี่ (อารมณ์ ความคิด เหตุการณ์)",
    "ทำแบบประเมิน Thought Record",
    "ติดตามผลสรุปรายวัน",
    "ยืนยันการทำแบบฝึกหัด CBT ",
  ],
  [ // Day 2
    "เขียนไดอารี่: บันทึกอารมณ์ที่เด่นที่สุดในวัน",
    "ระบุปัจจัยกระตุ้นที่ทำให้รู้สึกเชิงลบ",
    "ทำ Thought Record",
    "ติดตามความเปลี่ยนแปลงจากเมื่อวาน",
  ],
  [ // Day 3
    "เขียนไดอารี่: บันทึกความคิดที่ผุดขึ้นทันที",
    "แยกความคิดจริง vs ความคิดอัตโนมัติ",
    "ทำ Thought Record",
    "สะท้อนว่า “ถ้ามองจากคนอื่น เขาจะคิดอย่างไร?”",
  ],
  [ // Day 4
    "เขียนไดอารี่: วันนี้ฉันลองมองอีกมุมคือ...",
    "ทำ Thought Record",
    "ประเมินระดับอารมณ์หลังปรับมุมมองใหม่",
    "สะท้อนว่าอะไรช่วยให้รู้สึกดีขึ้น",
  ],
  [ // Day 5
    "เขียนไดอารี่: ฉันเลือกทำสิ่งนี้เพื่อดูแลตัวเอง...",
    "ทดลองทำพฤติกรรมใหม่",
    "Thought Record: วิเคราะห์ผลลัพธ์",
    "ติดตามอารมณ์ก่อน-หลังทำ",
  ],
  [ // Day 6
    "ไดอารี่: สิ่งที่ฉันภูมิใจในสัปดาห์นี้คือ...",
    "Thought Record: เหตุการณ์ดี + วิเคราะห์",
    "ระบุคุณค่าหรือจุดแข็งของตัวเอง",
    "เขียนประโยคให้กำลังใจตัวเอง 1 ประโยค",
  ],
  [ // Day 7
    "ไดอารี่สรุป: ฉันเรียนรู้อะไรเกี่ยวกับตัวเองบ้าง",
    "สรุป Thought Record รายสัปดาห์",
    "วางแผนถัดไปในการดูแลสุขภาพจิต",
    "ยืนยันการจบ CBT รายสัปดาห์",
  ],
];



const getTodayChecklistIndex = () => {
  let startDate = new Date(localStorage.getItem("cbtChecklistStart") || new Date().toISOString());
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays > 6) {
    startDate = now;
    localStorage.setItem("cbtChecklistStart", startDate.toISOString());
    return 0;
  }

  return diffInDays;
};

const getChecklistStatus = (index: number) => {
  const saved = localStorage.getItem(`cbtChecklistStatus-${index}`);
  return saved ? JSON.parse(saved) : [false, false, false, false];
};

const saveChecklistStatus = (index: number, status: boolean[]) => {
  localStorage.setItem(`cbtChecklistStatus-${index}`, JSON.stringify(status));
};
 const showSuccessLog = () => {
  MySwal.fire({
    toast: true,
    position: "top-end", // ด้านขวาบน,
    title: "บันทึกประจำวันสำเร็จ",
    html: `
      <div style="text-align: left; font-size: 14px; margin-top: 6px;">
        <div style="display: flex; align-items: center; margin-bottom: 6px;">
          <div style="background-color: black; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px;">
            ✔
          </div>
          จดบันทึกไดอารี่รายวันสำเร็จ
        </div>
        <div style="display: flex; align-items: center;">
          <div style="background-color: black; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 8px;">
            ✔
          </div>
          อัปโหลด CBT สำเร็จ
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "#ffffff",
    timer: 4000,
    timerProgressBar: true,
    customClass: {
      popup: "swal2-elegant-popup",
    },
  });
};
const todayIndex = getTodayChecklistIndex();
const checklist = checklistSets[todayIndex];
const [status, setStatus] = useState([false, false, false, false]);
useEffect(() => {
  const todayIndex = getTodayChecklistIndex();
  setStatus(getChecklistStatus(todayIndex));
}, []);
const toggleChecklistItem = (idx: number) => {
  const todayIndex = getTodayChecklistIndex();
  const newStatus = [...status];
  newStatus[idx] = !newStatus[idx];
  setStatus(newStatus);
  saveChecklistStatus(todayIndex, newStatus);
};

return (
  <div className="summary-wrapper">
<div className="summary-grid">
 <div className="summary-box">
  <h3 className="summary-title">CHECKLIST</h3>
  <ul className="checklist-items">
    {checklist.map((item, idx) => (
      <li key={idx} onClick={() => toggleChecklistItem(idx)} style={{ cursor: "pointer" }}>
        <img
          src={
            status[idx]
              ? "https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
              : "https://cdn-icons-png.flaticon.com/128/3515/3515278.png"
          }
          width={20}
          style={{ marginRight: "8px" }}
        />
        {item}
      </li>
    ))}
  </ul>
</div>

  <div className="summary-box">
    <h3 className="summary-title">Feedback</h3>
  </div>

  <div className="summary-box">
    <h3 className="summary-title">สรุป Summary Text(Diary)</h3>
  </div>

  <div className="summary-box">
    <h3 className="summary-title">สรุปอารมณ์ Thought Record</h3>
  </div>
</div>


  </div>

);
}
export default HomePage;
