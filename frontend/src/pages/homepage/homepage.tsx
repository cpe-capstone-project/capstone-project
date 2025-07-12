import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./HomePage.css";
import { GetLatestDiaries } from "../../services/https/Diary";
import type { DiaryInterface } from "../../interfaces/IDiary";
import pamemoImage from "../../assets/pamemo.png";
import pamemoI1mage from "../../assets/pamemo1.png";
import DiarySummaryChart from "../../components/DiarySummaryChart/DiarySummaryChart";
import UsageLineChart from "../../components/UsageLineChart/UsageLineChart";
import EmotionDonutChart from "../../components/EmotionDonutChart/EmotionDonutChart";
import helpcenterImage from "../../assets/helpcenter.png";
import healheartImage from "../../assets/healheart.png";


function HomePage() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const [latestDiaries, setLatestDiaries] = useState<DiaryInterface[]>([]);
  const [checklist, setChecklist] = useState({
    diary: false,
    thoughtRecord: false,
    dailySummary: false,
    cbtConfirm: false,
  });
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

  useEffect(() => {
    GetLatestDiaries(3).then((res) => {
      if (res.status === 200) {
        setLatestDiaries(res.data);
      }
    });
  }, []);
// ✅ คำนวณ summaryData ก่อน return
// สมมุติข้อมูล demo:
const loginStats = [
  { date: "2025-07-01", count: 2 },
  { date: "2025-07-02", count: 5 },
  { date: "2025-07-03", count: 3 },
  { date: "2025-07-04", count: 4 },
];
const summaryData = React.useMemo(() => {
  const monthMap = new Map<string, number>();

  latestDiaries.forEach((d) => {
    const date = new Date(d.UpdatedAt ?? "");
    const monthLabel = date.toLocaleString("th-TH", {
      month: "long",
      year: "numeric",
    });

    monthMap.set(monthLabel, (monthMap.get(monthLabel) || 0) + 1);
  });

  return Array.from(monthMap.entries()).map(([month, count]) => ({
    month,
    count,
  }));
}, [latestDiaries]);

// ✅ แล้วค่อยสร้าง total / average / firstDate / lastDate ต่อจาก summaryData
const diaryTotal = latestDiaries.length;

const firstDate = latestDiaries.length
  ? new Date(Math.min(...latestDiaries.map((d) => new Date(d.UpdatedAt ?? "").getTime())))
  : null;

const lastDate = latestDiaries.length
  ? new Date(Math.max(...latestDiaries.map((d) => new Date(d.UpdatedAt ?? "").getTime())))
  : null;

const monthCount = summaryData.length;
const avgPerMonth = monthCount > 0 ? Math.round(diaryTotal / monthCount) : 0;

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => {
      const newChecklist = { ...prev, [key]: !prev[key] };

      // หาก checklist "diary" และ "cbtConfirm" ถูกติ๊ก ให้แสดง Swal
      if (
        key === "diary" &&
        !prev.diary &&
        newChecklist.diary &&
        newChecklist.cbtConfirm
      ) {
        showSuccessLog();
      }
      if (
        key === "cbtConfirm" &&
        !prev.cbtConfirm &&
        newChecklist.diary &&
        newChecklist.cbtConfirm
      ) {
        showSuccessLog();
      }

      return newChecklist;
    });
  };
const handleChecklistClick = () => {
  MySwal.fire({
    title: "<strong>CHECKLIST</strong>",
    html: `
      <ul id="checklist-ul" style="text-align: left; list-style: none; padding: 0; font-size: 16px; color: #333;">
        <li style="margin-bottom: 12px; cursor: pointer;">
          <img src="https://cdn-icons-png.flaticon.com/128/3515/3515278.png" width="20" style="margin-right: 8px;" />
          จดบันทึกไดอารี่
        </li>
        <li style="margin-bottom: 12px; cursor: pointer;">
          <img src="https://cdn-icons-png.flaticon.com/128/3515/3515278.png" width="20" style="margin-right: 8px;" />
          ทำแบบประเมิน Thought Record
        </li>
        <li style="margin-bottom: 12px; cursor: pointer;">
          <img src="https://cdn-icons-png.flaticon.com/128/3515/3515278.png" width="20" style="margin-right: 8px;" />
          ติดตามผลสรุปรายวัน
        </li>
        <li style="cursor: pointer;">
          <img src="https://cdn-icons-png.flaticon.com/128/3515/3515278.png" width="20" style="margin-right: 8px;" />
          ยืนยันการทำแบบฝึกหัด CBT
        </li>
      </ul>
    `,
    background: "#fff",
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      const icons = Swal.getPopup()?.querySelectorAll("ul#checklist-ul li");
      icons?.forEach((item) => {
        item.addEventListener("click", () => {
          const img = item.querySelector("img");
          const checked = img?.getAttribute("src") === "https://cdn-icons-png.flaticon.com/128/8968/8968524.png";
          img?.setAttribute(
            "src",
            checked
              ? "https://cdn-icons-png.flaticon.com/128/3515/3515278.png" // ⭕
              : "https://cdn-icons-png.flaticon.com/128/8968/8968524.png" // ✔️
          );
        });
      });
    },
    customClass: {
      popup: "swal2-elegant-popup"
    },
  });
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
const handleShowAllDiaries = () => {
  const diaryHTML = latestDiaries.map(
    (d) => `
      <div style="text-align: left; padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${d.Title}</strong>
        <p style="margin: 6px 0; font-size: 14px; color: #333;">${(d.Content ?? "").slice(0, 100)}...</p>
        <small style="color: #888;">อัปเดตเมื่อ: ${d.UpdatedAt ? new Date(d.UpdatedAt).toLocaleDateString("th-TH") : "-"}</small>
      </div>
    `
  ).join("");

  MySwal.fire({
    title: "📖 รายการบันทึกของคุณ",
    html: `<div style="max-height: 300px; overflow-y: auto;">${diaryHTML}</div>`,
    width: 600,
    background: "#ffffff",
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      popup: "swal2-elegant-popup"
    }
  });
};
return (
  <div className="housemed-homepage">
    <main className="housemed-main-content">
      {/* CHECKLIST SECTION */}
      <div
        className="housemed-checklist-section"
        onClick={handleChecklistClick}
        style={{
          backgroundImage: `url(${pamemoI1mage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          borderRadius: "16px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.06)",
          padding: "2rem",
          flex: 1,
          minWidth: "280px",
          maxWidth: "320px",
          color: "#222",
          backdropFilter: "blur(2px)",
          cursor: "pointer",
        }}
      ></div>

      {/* NOTE CENTER IMAGE */}
      <div
        className="housemed-note-center"
        style={{
          backgroundImage: `url(${pamemoImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div>

      {/* LATEST DIARY SECTION + ICON FLOAT */}
      <div style={{ position: "relative" }}>
        {/* Floating Icon */}
       <img
  src="https://cdn-icons-png.flaticon.com/128/3237/3237849.png"
  alt="ดูทั้งหมด"
  onClick={handleShowAllDiaries}
  style={{
    position: "absolute",
    top: "-10px",
    right: "-10px",
    width: "36px",
    height: "36px",
    padding: "4px", // เพิ่ม padding ให้ภาพไม่ติดขอบ
    backgroundColor: "#fff", // หรือใส่สีพื้นหลังขาวเพื่อ contrast
    border: "2px solid #000", // ✅ ขอบสีดำ
    borderRadius: "50%", // ✅ ทำให้เป็นวงกลม
    cursor: "pointer",
    zIndex: 10,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)", // เงานิดๆ ให้ดู float
  }}
/>

       <div className="latest-diary-box">
  <h2 className="section-title">📊 สรุปจำนวนไดอารี่รายเดือน</h2>

  <div style={{ marginBottom: "1rem", fontSize: "0.95rem", color: "#333" }}>
    <p>📄 ทั้งหมด: <strong>{diaryTotal}</strong> รายการ</p>
    <p>📅 ตั้งแต่: <strong>{firstDate?.toLocaleDateString("th-TH") ?? "-"}</strong> ถึง <strong>{lastDate?.toLocaleDateString("th-TH") ?? "-"}</strong></p>
    <p>📈 เฉลี่ยต่อเดือน: <strong>{avgPerMonth}</strong> รายการ</p>
  </div>

  <DiarySummaryChart summaryData={summaryData} />
</div>

      </div>
    </main>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "2rem",
    flexWrap: "wrap",
   
  }}
>
  {/* กล่องซ้าย: การเข้าใช้งาน */}
  <div className="usage-activity-box">
    <h2 className="section-title">📈 การเข้าใช้งานล่าสุด</h2>
    <UsageLineChart data={loginStats} />
  </div>
  {/* ✅ กล่องโฆษณาใหม่ */}
 <div
  className="advertisement-box"
  style={{
    flex: 1,
    minWidth: "800px",
    maxWidth: "450px",
    height: "368px",
    backgroundImage: `url(${healheartImage})`, // ✅ พื้นหลังรูป
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#ffffff",
    border: "1px solid #eee",
    borderRadius: "16px",
    padding: "2rem",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
    marginTop: "2rem",
  }}
></div>

</div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "2rem",
    flexWrap: "wrap",
    marginTop: "2rem",
  }}
>
  {/* กล่องซ้าย: Emotion Donut */}
  <div className="usage-activity-box" style={{ flex: 1, minWidth: "400px" }}>
    <EmotionDonutChart />
  </div>
<div
  className="helpcenter-banner"
  style={{
    width: "800px",
    height: "450px",
    backgroundImage: `url(${helpcenterImage})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top",
    backgroundColor: "#fff",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
    flexShrink: 0,
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end", // ดันปุ่มลงล่าง
    alignItems: "center",
    paddingBottom: "1rem",
    
  }}
>
  <button
    style={{
      backgroundColor: "#222",
      border: "none",
      borderRadius: "8px",
      padding: "0.6rem 1.2rem",
      cursor: "pointer",
      color: "#fff",
      fontWeight: "bold",
      fontSize: "0.95rem",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      transition: "all 0.2s ease-in-out",
      marginBottom: "7.5rem", // ✅ ขยับขึ้น (เพราะมีระยะด้านล่าง)
      
    }}
    onClick={() =>
      window.open(
        "https://www.bangkokhospital.com/th/ratchasima/center-clinic/brain/mental-health-bkh/overview",
        "_blank"
      )
    }
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#444")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#222")}
  >
    ไปยังศูนย์ช่วยเหลือ
  </button>
</div>

  
</div>


  </div>
);
}
export default HomePage;
