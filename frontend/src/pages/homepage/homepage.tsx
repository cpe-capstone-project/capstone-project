import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./HomePage.css";
import diaryImage from "../../assets/diary.png";
import recordImage from "../../assets/record.png";
import medImage from "../../assets/med.png";
import SymmedImage from "../../assets/symmed.png"; // ใช้ชื่อไฟล์จริงที่คุณเซฟไว้
import { useEffect } from "react"; // เพิ่มไว้ด้านบนสุดด้วย

function HomePage() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const toggleProfileMenu = () => {
    setShowMenu(!showMenu);
  };
useEffect(() => {
  const user = localStorage.getItem("user");
  if (!user) {
    Swal.fire({
      icon: "warning",
      title: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
    }).then(() => {
      navigate("/login");
    });
  }
}, []);
const handleEditProfile = () => {
  Swal.fire({
    title: user.email || "No email",
    imageUrl: "https://i.pinimg.com/736x/90/92/20/909220721b5f79574900deb68ebae5ff.jpg", // ลิงก์ตรงจาก Pinterest ไม่ได้แสดงภาพ ต้องใช้ลิงก์ภาพโดยตรง (หรือโหลดเก็บเอง)
   // imageWidth: 400,
    imageHeight: 200,
    imageAlt: "Profile image",
  });
};

  const handleLogout = () => {
    localStorage.removeItem("user"); // ✅ เคลียร์ session
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    Toast.fire({
      icon: "success",
      title: "Log out successfully"
    });

    // Delay navigate slightly so toast is visible
    setTimeout(() => {
      navigate("/cute");
    }, 500);
  };

  return (
    <div className="housemed-homepage">
      <header className="housemed-top-nav">
        <div className="housemed-logo">
  <img src={SymmedImage} alt="Symmed Logo" className="housemed-logo-img" />
  Depression Rec, Inc.
</div>
        <nav className="housemed-nav">
          <a href="#">HOME PAGE</a>
          <a href="#">DIARY</a>
          <a href="#">THOUGH RECORD</a>

          <div className="housemed-profile-wrapper">
            <div className="housemed-profile-icon" onClick={toggleProfileMenu}>
              <img
                src="https://cdn-icons-png.flaticon.com/128/1077/1077012.png"
                alt="Profile"
              />
            </div>

            {showMenu && (
              <div className="housemed-profile-menu">
                <button onClick={handleEditProfile}>Edit Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>
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
