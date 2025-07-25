import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./HomePage.css";
import DiarySummary from "../diary_summary/DiarySummary";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";
//import pamemo1 from "../assets/pamemo1.png"; // ปรับ path ให้ถูกต้องตามโปรเจกต์คุณ

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
  const [loginCount, setLoginCount] = useState(0);
  const [percentChange, setPercentChange] = useState(0);

  useEffect(() => {
    const email = localStorage.getItem("currentLoginUser") || "";
    const loginHistoryKey = `loginHistory-${email}`;
    const loginHistory = JSON.parse(
      localStorage.getItem(loginHistoryKey) || "{}"
    );

    const today = new Date();
    const todayStr = today.toLocaleDateString("th-TH");

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("th-TH");

    const todayCount = loginHistory[todayStr] || 0;
    const yesterdayCount = loginHistory[yesterdayStr] || 0;

    const percent =
      yesterdayCount > 0
        ? ((todayCount - yesterdayCount) / yesterdayCount) * 100
        : todayCount > 0
        ? 100 // ถ้าวันนี้มี แต่เมื่อวานไม่มีเลย → ถือเป็น +100%
        : 0; // ถ้าวันนี้ก็ไม่มี → แสดง 0%

    setLoginCount(todayCount);
    setPercentChange(percent);
  }, []);

  const currentDate = new Date();
  const formattedTime = currentDate.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = currentDate.toLocaleDateString("th-TH");
  const messageCount = 723; // สมมุติ
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

  return (
    <>
      {/* ส่วนบน: การ์ด potatopsy */}
      <div className="potatopsy-cards">
        {/* จำนวนเข้าใช้ระบบ */}
        <div className="potatopsy-card turquoise">
          <div className="potatopsy-card-left">
            <div className="potatopsy-card-icon-wrapper">
              <img
                src="https://cdn-icons-png.flaticon.com/128/2198/2198366.png"
                alt="login"
              />
            </div>
            <p>จำนวนเข้าใช้ระบบ</p>
          </div>
          <div className="potatopsy-card-right">
            <h3>{loginCount} ครั้ง</h3>
            <span>
              {percentChange >= 0 ? "+" : ""}
              {percentChange.toFixed(1)}% จากเมื่อวาน
            </span>
          </div>
        </div>

        {/* เวลา */}
        <div className="potatopsy-card blue">
          <div className="potatopsy-card-left">
            <div className="potatopsy-card-icon-wrapper">
              <img
                src="https://cdn-icons-png.flaticon.com/128/992/992700.png"
                alt="time"
              />
            </div>
            <p>เวลา</p>
          </div>
          <div className="potatopsy-card-right">
            <h3>{formattedTime}</h3>
            <span>อัปเดตล่าสุด</span>
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
            <h3>{formattedDate}</h3>
            <span>ปัจจุบัน</span>
          </div>
        </div>

        {/* จำนวนข้อความ */}
        <div className="potatopsy-card green">
          <div className="potatopsy-card-left">
            <div className="potatopsy-card-icon-wrapper">
              <img
                src="https://cdn-icons-png.flaticon.com/128/542/542638.png"
                alt="message"
              />
            </div>
            <p>จำนวนข้อความ</p>
          </div>
          <div className="potatopsy-card-right">
            <h3>{messageCount} ข้อความ</h3>
            <span>+8.3% สัปดาห์นี้</span>
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
