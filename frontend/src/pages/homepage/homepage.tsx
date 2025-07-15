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

// แสดงคำแนะนำเมื่อผู้ป่วยคลิกภาพกลาง
const handlePatientGuideClick = () => {
  MySwal.fire({
    title: "<strong>🧘‍♀️ วิธีใช้งานระบบเพื่อดูแลสุขภาพจิต</strong>",
    html: `
      <div style="text-align: left; font-size: 16px; color: #333; padding: 4px;">
        <p><strong>ยินดีต้อนรับเข้าสู่ระบบการดูแลสุขภาพจิตแบบ CBT (Cognitive Behavioral Therapy)</strong></p>
        <p>ระบบนี้ออกแบบมาเพื่อให้คุณสามารถเข้าใจความคิด ความรู้สึก และพฤติกรรมของตัวเองได้ดียิ่งขึ้น ผ่านการฝึกฝนเป็นขั้นตอนรายวัน</p>
        <hr/>
        <ul style="padding-left: 0; list-style: none;">
          <li style="margin-bottom: 16px;">
            ✅ <strong>1. จดบันทึกไดอารี่ (Diary)</strong><br/>
            ในแต่ละวันคุณสามารถบันทึกความรู้สึก ความคิด และเหตุการณ์ที่เกิดขึ้น เพื่อช่วยให้คุณระบายอารมณ์และสังเกตแนวโน้มความรู้สึกตนเอง เช่น<br/>
            <em>"วันนี้ฉันรู้สึกไม่ดีหลังจากคุยกับหัวหน้า..."</em><br/>
            การเขียนไดอารี่จะช่วยให้คุณเริ่มเข้าใจว่าอะไรเป็นตัวกระตุ้นอารมณ์ และช่วยสะท้อนความคิดอย่างเป็นระบบ
          </li>
          <li style="margin-bottom: 16px;">
            🧠 <strong>2. ทำแบบประเมินความคิด (Thought Record)</strong><br/>
            เป็นแบบฝึกที่ช่วยให้คุณแยกแยะ "ความคิดอัตโนมัติ" ที่เกิดขึ้นทันทีเมื่อรู้สึกแย่ เช่น "เราไม่เก่งเลย" แล้วสำรวจว่า ความคิดนั้นเป็นจริงหรือไม่<br/>
            คุณจะได้ฝึกระบุเหตุการณ์ → ความคิด → อารมณ์ → พฤติกรรม → ผลลัพธ์<br/>
            แบบฝึกนี้ใช้ได้กับเหตุการณ์ต่างๆ ทั้งเรื่องงาน ครอบครัว หรือความสัมพันธ์
          </li>
          <li style="margin-bottom: 16px;">
            📊 <strong>3. ติดตามผลและอารมณ์รายวัน</strong><br/>
            ระบบจะช่วยคุณติดตามแนวโน้มอารมณ์ผ่านกราฟรายวัน (เช่น ความรู้สึกเศร้า กังวล ดีใจ ฯลฯ)<br/>
            ทำให้คุณเห็นว่าความรู้สึกเปลี่ยนแปลงอย่างไรในแต่ละวัน และช่วยเตือนสติเวลาเริ่มเข้าสู่ช่วงเสี่ยง
          </li>
          <li style="margin-bottom: 16px;">
            📝 <strong>4. ทำแบบฝึกหัด CBT รายวัน (Checklist)</strong><br/>
            ทุกวันคุณจะได้รับ Checklist แบบ 7 วัน ที่ออกแบบมาไม่ซ้ำกัน เช่น<br/>
            - สำรวจความคิด<br/>
            - ฝึกเปลี่ยนมุมมอง<br/>
            - ทดลองพฤติกรรมใหม่<br/>
            - สรุปและวางแผนต่อเนื่อง<br/>
            เมื่อทำครบ 4 ข้อ จะถือว่าเสร็จสิ้นในแต่ละวัน และระบบจะเลื่อนไปชุดถัดไปโดยอัตโนมัติในวันถัดไป
          </li>
          <li style="margin-bottom: 16px;">
            🎯 <strong>5. เป้าหมายของคุณ</strong><br/>
            คือการฝึกความเข้าใจตนเองอย่างสม่ำเสมอ เพื่อจัดการอารมณ์ลบ ความคิดอัตโนมัติ และสร้างความยืดหยุ่นทางจิตใจ (Emotional Resilience)<br/>
            คุณจะเห็นความเปลี่ยนแปลงของตัวเองในเวลาไม่กี่วัน หากทำอย่างสม่ำเสมอ
          </li>
        </ul>
        <p><em>จำไว้ว่า… คุณไม่ได้อยู่คนเดียว และทุกความรู้สึกของคุณมีคุณค่า ❤️</em></p>
      </div>
    `,
    width: 680,
    background: "#fff",
    showCloseButton: true,
    confirmButtonText: "เข้าใจแล้ว",
    confirmButtonColor: "#6c63ff",
    customClass: {
      popup: "swal2-elegant-popup",
    },
  });
};

const getTodayChecklistIndex = () => {
  const startDate = new Date(localStorage.getItem("cbtChecklistStart") || new Date().toISOString());
  localStorage.setItem("cbtChecklistStart", startDate.toISOString());

  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(diffInDays, 6); // Day 0-6 (7 วัน)
};
const getChecklistStatus = (index: number) => {
  const saved = localStorage.getItem(`cbtChecklistStatus-${index}`);
  return saved ? JSON.parse(saved) : [false, false, false, false];
};

const saveChecklistStatus = (index: number, status: boolean[]) => {
  localStorage.setItem(`cbtChecklistStatus-${index}`, JSON.stringify(status));
};

const handleChecklistClick = () => {
  const todayIndex = getTodayChecklistIndex();
  const checklist = checklistSets[todayIndex];
  let status = getChecklistStatus(todayIndex);

  const listHtml = checklist
    .map((item, idx) => `
      <li style="margin-bottom: 12px; cursor: pointer;" data-index="${idx}">
        <img src="${status[idx]
          ? "https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
          : "https://cdn-icons-png.flaticon.com/128/3515/3515278.png"
        }" width="20" style="margin-right: 8px;" />
        ${item}
      </li>
    `)
    .join("");

  MySwal.fire({
    title: `<strong>CHECKLIST DAY ${todayIndex + 1}</strong>`,
    html: `<ul id="checklist-ul" style="text-align: left; list-style: none; padding: 0;">${listHtml}</ul>`,
    background: "#fff",
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      const items = Swal.getPopup()?.querySelectorAll("ul#checklist-ul li");
      items?.forEach((item) => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-index")!);
          const img = item.querySelector("img");
          status[idx] = !status[idx];
          saveChecklistStatus(todayIndex, status);
          img?.setAttribute(
            "src",
            status[idx]
              ? "https://cdn-icons-png.flaticon.com/128/8968/8968524.png"
              : "https://cdn-icons-png.flaticon.com/128/3515/3515278.png"
          );
        });
      });
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
    cursor: "pointer",
  }}
></div>


      <div
  className="housemed-note-center"
  onClick={handlePatientGuideClick}
  style={{
    backgroundImage: `url(${pamemoImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    borderRadius: "16px",
    cursor: "pointer",
    minHeight: "280px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
