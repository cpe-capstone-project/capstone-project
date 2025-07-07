import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import FiledecImage from "../../assets/filedec.png";
import SymmedImage from "../../assets/symmed.png";
const Homedoc: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");

  useEffect(() => {
    if (!isLogin || role !== "Psychologist") {
      Swal.fire({
        icon: "warning",
        title: "คุณต้องเข้าสู่ระบบด้วยบัญชีนักจิตวิทยา",
      }).then(() => {
        navigate("/");
      });
    }
  }, []);

  const toggleProfileMenu = () => {
    setShowMenu(!showMenu);
  };

  const prowo = () => {
    Swal.fire({
      title: email || "No email",
      imageUrl:
        "https://i.pinimg.com/736x/90/92/20/909220721b5f79574900deb68ebae5ff.jpg",
      imageHeight: 200,
      imageAlt: "Profile image",
    });
  };

  const handleLogout = () => {
    localStorage.clear(); // เคลียร์ข้อมูลทั้งหมด
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    Toast.fire({
      icon: "success",
      title: "Log out successfully",
    });

    setTimeout(() => {
      navigate("/");
    }, 500);
  };
  return (
    <div className="docflour-homepage">
      {/* Welcome Box */}
      <section className="docflour-welcome-box">
        <h1>Welcome, fellow psychologist.</h1>
        <p>Let’s take care of others — and ourselves.</p>
      </section>

      {/* Therapy Case Section */}
      <section className="docflour-therapy-section">
        <div className="docflour-icon-card">
         <img src={FiledecImage} alt="Logo" className="case file" />
        </div>
        <div className="docflour-case-content">
          <h2>Therapy Cases</h2>
          <p>
            FOLLOW UP BY REVIEWING CURRENT CONDITION, EVALUATING PROGRESS,
            ADJUSTING TREATMENT AS NEEDED, AND PLANNING NEXT STEPS.
          </p>
          <button className="docflour-start-button">LET’S START</button>
        </div>
      </section>
    </div>
  );
};

export default Homedoc;
