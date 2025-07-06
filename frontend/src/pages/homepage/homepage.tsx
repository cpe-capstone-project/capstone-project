import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./HomePage.css";
import diaryImage from "../../assets/diary.png";
import recordImage from "../../assets/record.png";
import medImage from "../../assets/med.png";

function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true" || role !== "Patient") {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
      }).then(() => {
        navigate("/"); // กลับหน้า login
      });
    }
  }, [navigate]);

  return (
    <div className="housemed-homepage">
      <main className="housemed-main-content">
        <div className="housemed-left-section">
          <h1>Welcome to your mental wellness space</h1>
          <p className="housemed-subtitle">
            "Your health, our mission." <br /> Let’s take today one step at a time.
          </p>

     <div className="housemed-feature-container">
  <section className="housemed-feature">
    <div className="housemed-feature-left">
      <h2>Dairy</h2>
      <img src={diaryImage} alt="Diary illustration" className="housemed-icon" />
    </div>

    <div className="housemed-feature-right">
      <button className="housemed-start-btn">LET’S START</button>
      <p className="housemed-feature-desc">
        "Reflect, reframe, and grow through your thoughts."
      </p>
    </div>
  </section>

  <section className="housemed-feature">
    <div className="housemed-feature-left">
      <h2>Thought Record</h2>
      <img src={recordImage} alt="Thought record illustration" className="housemed-icon" />
    </div>

    <div className="housemed-feature-right">
      <button className="housemed-start-btn">LET’S START</button>
      <p className="housemed-feature-desc">
        "Write from the heart — your thoughts are safe here."
      </p>
    </div>
  </section>
</div>
</div>
        <div className="housemed-right-section">
          <img src={medImage} alt="Doctor and patient" className="housemed-doctor-img" />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
