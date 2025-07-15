import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import "./Navbar.css";
import Swal from "sweetalert2";
import healthImage from "../../assets/med5.png";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };
const handleEditProfile = async () => {
  setShowMenu(false);
  
  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");

  const profileImage = "https://cdn-icons-png.flaticon.com/128/149/149071.png"; // หรือโหลดจาก profile.image ถ้ามี

  // STEP 1: แสดงข้อมูลแบบ preview
  const result = await Swal.fire({
    title: `<div style="display: flex; flex-direction: column; align-items: center;">
              <span>ข้อมูลโปรไฟล์ของคุณ</span>
              <img src="${profileImage}" style="border-radius: 50%; width: 80px; height: 80px; margin-bottom: 12px;" />
            </div>`,
    html: `
      <div style="text-align: left;">
        <p><b>ชื่อ:</b> ${profile.first_name || "-"} <b>นามสกุล:</b> ${profile.last_name || "-"}</p>
        <p><b>เพศ:</b> ${profile.gender || "-"}</p>
        <p><b>ที่อยู่:</b> ${profile.address || "-"}</p>
        <p><b>วันเกิด:</b> ${profile.birthday || "-"}</p>
        <p><b>เบอร์โทรศัพท์:</b> ${profile.email || "-"}</p>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "แก้ไขโปรไฟล์",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
    customClass: {
      htmlContainer: "profile-popup",
    },
  });

  if (result.isConfirmed) {
    // STEP 2: โหมดแก้ไขโปรไฟล์
    const { value: formValues } = await Swal.fire({
  title: `<div style="display: flex; flex-direction: column; align-items: center;">
            <span>ข้อมูลโปรไฟล์ของคุณ</span>
            <img src="${profileImage}" style="border-radius: 50%; width: 80px; height: 80px; margin-bottom: 12px;" />
          </div>`,
  html: `
    <input id="swal-input1" class="swal2-input" placeholder="${profile.first_name || ""}">
    <input id="swal-input2" class="swal2-input" placeholder="${profile.last_name || ""}">
    <input id="swal-input3" class="swal2-input" placeholder="${profile.gender || ""}">
    <input id="swal-input4" class="swal2-input" placeholder="${profile.address || ""}">
    <input id="swal-input5" class="swal2-input" placeholder="${profile.birthday || ""}">
    <input id="swal-input6" class="swal2-input" placeholder="${profile.email || ""}">
  `,
  focusConfirm: false,
  showCancelButton: true,
  confirmButtonText: "บันทึก",
  cancelButtonText: "ยกเลิก",
  reverseButtons: true,
  customClass: {
    confirmButton: "swal-btn-confirm",
    cancelButton: "swal-btn-cancel",
  },
  preConfirm: () => {
    return {
      first_name: (document.getElementById("swal-input1") as HTMLInputElement).value || profile.first_name,
      last_name: (document.getElementById("swal-input2") as HTMLInputElement).value || profile.last_name,
      gender: (document.getElementById("swal-input3") as HTMLInputElement).value || profile.gender,
      address: (document.getElementById("swal-input4") as HTMLInputElement).value || profile.address,
      birthday: (document.getElementById("swal-input5") as HTMLInputElement).value || profile.birthday,
      email: (document.getElementById("swal-input6") as HTMLInputElement).value || profile.email,
    };
  }
});


    if (formValues) {
      localStorage.setItem("userProfile", JSON.stringify(formValues));
      Swal.fire("สำเร็จ", "ข้อมูลโปรไฟล์ถูกอัปเดตแล้ว", "success");
    }
  }
};





  const out = () => {
    localStorage.clear();

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
    <section className="navbar">
      <a href="/patient">
        <img className="logo" src={healthImage} alt="Health Logo" />
      </a>
      <ul className="menu">
        <li>
          <a onClick={() => handleNavigate("home")}>Dashboard</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("diary")}>Diary</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("thought")}>Thought Record</a>
        </li>
        <div style={{ position: "relative" }}>
          <img
            className="profile"
            src="https://cdn-icons-png.flaticon.com/128/1430/1430402.png"
            alt=""
            onClick={() => setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="housemed-profile-menu">
              <button onClick={handleEditProfile}>Edit Profile</button>
              <button onClick={out}>Logout</button>
            </div>
          )}
        </div>
      </ul>
    </section>
  );
}

export default NavBar;
