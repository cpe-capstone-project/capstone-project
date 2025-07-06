import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./HomePage.css";
import diaryImage from "../../assets/diary.png";
import recordImage from "../../assets/record.png";
import { GetLatestDiaries } from "../../services/https/Diary";
import type { DiaryInterface } from "../../interfaces/IDiary";

function HomePage() {
  const navigate = useNavigate();
  const [latestDiaries, setLatestDiaries] = useState<DiaryInterface[]>([]);
  const [checklist, setChecklist] = useState({
    diary: false,
    thoughtRecord: false,
    dailySummary: false,
    cbtConfirm: false,
  });

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

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="housemed-homepage">
      <main className="housemed-main-content">
        {/* CHECKLIST SECTION */}
        <div className="housemed-checklist-section">
          <h1 className="main-title">Welcome to your mental wellness space</h1>
          <p className="housemed-subtitle">
            "Your health, our mission." <br /> Let’s take today one step at a time.
          </p>

          <h2 className="checklist-title">CHECKLIST</h2>
          <div className="checklist-item" onClick={() => toggleCheck("diary")}>
            <span className={`check-icon ${checklist.diary ? "checked" : ""}`}>
              {checklist.diary ? "✔️" : "⭕"}
            </span>
            จดบันทึกไดอารี่
          </div>
          <div className="checklist-item" onClick={() => toggleCheck("thoughtRecord")}>
            <span className={`check-icon ${checklist.thoughtRecord ? "checked" : ""}`}>
              {checklist.thoughtRecord ? "✔️" : "⭕"}
            </span>
            ทำแบบประเมิน Though Record
          </div>
          <div className="checklist-item" onClick={() => toggleCheck("dailySummary")}>
            <span className={`check-icon ${checklist.dailySummary ? "checked" : ""}`}>
              {checklist.dailySummary ? "✔️" : "⭕"}
            </span>
            ติดตามผลสรุปรายวัน
          </div>
          <div className="checklist-item" onClick={() => toggleCheck("cbtConfirm")}>
            <span className={`check-icon ${checklist.cbtConfirm ? "checked" : ""}`}>
              {checklist.cbtConfirm ? "✔️" : "⭕"}
            </span>
            ยืนยันการทำแบบฝึกหัด CBT
          </div>
        </div>

        {/* CENTER NOTE */}
        <div className="housemed-note-center">
          <span role="img" aria-label="note">
            🖊
          </span>{" "}
          กระดาษจดบันทึก
        </div>

        {/* DIARY SECTION */}
        <div className="housemed-right-section">
          <div className="latest-diary-box">
            <h2 className="section-title">📘 ไดอารี่ล่าสุดของคุณ</h2>
            <div className="diary-preview-list">
              {latestDiaries.map((d) => (
                <div key={d.ID} className="diary-card">
                  <h3>{d.Title}</h3>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: (d.Content ?? "").slice(0, 100) + "...",
                    }}
                  />
                  <small>
                    อัปเดตเมื่อ:{" "}
                    {d.UpdatedAt
                      ? new Date(d.UpdatedAt).toLocaleDateString("th-TH")
                      : "-"}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
