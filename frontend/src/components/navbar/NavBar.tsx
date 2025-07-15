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
  const genderMap: Record<string, string> = {
  "1": "ชาย",
  "2": "หญิง",
  "3": "อื่นๆ",
};
const handleEditProfile = async () => {
  setShowMenu(false);

  const profile = {
    first_name: localStorage.getItem("first_name") || "-",
    last_name: localStorage.getItem("last_name") || "-",
    address: localStorage.getItem("address") || "-",
    birthday: localStorage.getItem("birthday") || "-",
    email: localStorage.getItem("email") || "-",
    phone: localStorage.getItem("phone") || "-",
    image: localStorage.getItem("profile_image") || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png",
    gender: genderMap[localStorage.getItem("gender") || ""] || "-", // แสดงข้อความ Male/Female/Other
  };

  const result = await Swal.fire({
    title: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <span>ข้อมูลโปรไฟล์ของคุณ</span>
        <img src="${profile.image}" style="border-radius: 50%; width: 80px; height: 80px; margin-bottom: 12px;" />
      </div>`,
    html: `
      <div style="text-align: left;">
        <p><b>ชื่อ:</b> ${profile.first_name} <b>นามสกุล:</b> ${profile.last_name}</p>
        <p><b>เพศ:</b> ${profile.gender}</p>
        <p><b>ที่อยู่:</b> ${profile.address}</p>
        <p><b>วันเกิด:</b> ${profile.birthday}</p>
        <p><b>เบอร์โทรศัพท์:</b> ${profile.phone}</p>
        <p><b>Email:</b> ${profile.email}</p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: "แก้ไขโปรไฟล์",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
  });

  if (result.isConfirmed) {
    const { value: formValues } = await Swal.fire({
      title: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <span>แก้ไขโปรไฟล์</span>
          <img id="preview-img" src="${profile.image}" style="border-radius: 50%; width: 80px; height: 80px; margin-bottom: 12px;" />
          <input type="file" accept="image/*" id="image-upload" style="margin-bottom: 10px;" />
        </div>`,
      html: `
        <input id="swal-input1" class="swal2-input" placeholder="${profile.first_name}">
        <input id="swal-input2" class="swal2-input" placeholder="${profile.last_name}">
        <input id="swal-input3" class="swal2-input" placeholder="${profile.gender}">
        <input id="swal-input4" class="swal2-input" placeholder="${profile.address}">
        <input id="swal-input5" class="swal2-input" placeholder="${profile.birthday}">
        <input id="swal-input6" class="swal2-input" placeholder="${profile.phone}">
        <input id="swal-input7" class="swal2-input" placeholder="${profile.email}">
      `,
      didOpen: () => {
        const fileInput = document.getElementById("image-upload") as HTMLInputElement;
        const previewImg = document.getElementById("preview-img") as HTMLImageElement;
        if (fileInput && previewImg) {
          fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                previewImg.src = reader.result as string;
              };
              reader.readAsDataURL(file);
            }
          });
        }
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      preConfirm: () => {
        const previewImg = document.getElementById("preview-img") as HTMLImageElement;
        return {
          first_name: (document.getElementById("swal-input1") as HTMLInputElement).value || profile.first_name,
          last_name: (document.getElementById("swal-input2") as HTMLInputElement).value || profile.last_name,
          gender: (document.getElementById("swal-input3") as HTMLInputElement).value || profile.gender,
          address: (document.getElementById("swal-input4") as HTMLInputElement).value || profile.address,
          birthday: (document.getElementById("swal-input5") as HTMLInputElement).value || profile.birthday,
          phone: (document.getElementById("swal-input6") as HTMLInputElement).value || profile.phone,
          email: (document.getElementById("swal-input7") as HTMLInputElement).value || profile.email,
          image: previewImg?.src || profile.image,
        };
      },
    });

    if (formValues) {
      // บันทึกกลับ localStorage ทุก field
      localStorage.setItem("first_name", formValues.first_name);
      localStorage.setItem("last_name", formValues.last_name);
      localStorage.setItem("gender", formValues.gender);
      localStorage.setItem("address", formValues.address);
      localStorage.setItem("birthday", formValues.birthday);
      localStorage.setItem("phone", formValues.phone);
      localStorage.setItem("email", formValues.email);
      localStorage.setItem("profile_image", formValues.image);

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
  src={localStorage.getItem("profile_image") || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png"}
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
