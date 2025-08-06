import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import Swal from "sweetalert2";
import "./Sidebar.css";
import healthImage from "../../assets/med5.png";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };
 const fetchProfileAndUpdateStorage = async () => {
  try {
    const res = await fetch("http://localhost:8000/psychologist/profile", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("first_name", data.first_name);
      localStorage.setItem("last_name", data.last_name);
      localStorage.setItem("gender", data.gender.toString());
      localStorage.setItem("address", data.address);
      localStorage.setItem("birthday", data.birthday);
      localStorage.setItem("phone", data.phone);
      localStorage.setItem("email", data.email);
      localStorage.setItem("profile_image", data.image);
    }
  } catch (error) {
    console.error("โหลดโปรไฟล์ล้มเหลว", error);
  }
};

  const genderMap: Record<string, string> = {
  "1": "ชาย",
  "2": "หญิง",
  "3": "อื่นๆ",
};

const genderReverseMap: Record<string, number> = {
  "ชาย": 1,
  "หญิง": 2,
  "อื่นๆ": 3,
};

const Exchangeprofile = async () => {
  setShowMenu(false);

  const profile = {
    first_name: localStorage.getItem("first_name") || "-",
    last_name: localStorage.getItem("last_name") || "-",
    address: localStorage.getItem("address") || "-",
    birthday: localStorage.getItem("birthday") || "-",
    email: localStorage.getItem("email") || "-",
    phone: localStorage.getItem("phone") || "-",
    image: localStorage.getItem("profile_image") || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png",
    gender: genderMap[localStorage.getItem("gender") || ""] || "-",
  };

  // 🔹 Step 1: แสดงข้อมูลโปรไฟล์แบบอ่านอย่างเดียว
  const result = await Swal.fire({
    title: `<h3 style="margin-bottom: 1rem;">ข้อมูลโปรไฟล์ของคุณ</h3>`,
html: `
  <div class="psymeddc-popup">
    <!-- Sidebar -->
    <div class="psymeddc-profile-sidebar">
      <ul>
        <li class="active" data-section="view">โปรไฟล์</li>
        <li data-section="edit">แก้ไขโปรไฟล์</li>
        <li>รหัสผ่าน</li>
        <li>สิ่งที่ชื่นชอบ</li>
      </ul>
    </div>

    <!-- รูปโปรไฟล์ -->
    <div class="psymeddc-profile-center">
      <img src="${profile.image}" alt="profile" class="psymeddc-profile-img" />
      <p style="margin-top: 10px; font-weight: 500;">รูปโปรไฟล์</p>
    </div>

    <!-- ข้อมูลโปรไฟล์ -->
    <div class="psymeddc-profile-info">
      <div class="psymeddc-profile-row two-col">
        <div><b>ชื่อ:</b> ${profile.first_name}</div>
        <div><b>นามสกุล:</b> ${profile.last_name}</div>
      </div>
      <div class="psymeddc-profile-row">
        <div><b>เพศ:</b> ${profile.gender}</div>
      </div>
      <div class="psymeddc-profile-row">
        <div><b>ที่อยู่:</b> ${profile.address}</div>
      </div>
      <div class="psymeddc-profile-row">
        <div><b>วันเกิด:</b> ${profile.birthday}</div>
      </div>
      <div class="psymeddc-profile-row">
        <div><b>เบอร์โทรศัพท์:</b> ${profile.phone}</div>
      </div>
      <div class="psymeddc-profile-row">
        <div><b>Email:</b> ${profile.email}</div>
      </div>
    </div>
  </div>
`,
customClass: { htmlContainer: "psymeddc-html-wrapper" },
width: "800px",
showCancelButton: true,
    confirmButtonText: "แก้ไขโปรไฟล์",
    cancelButtonText: "ยกเลิก",
    reverseButtons: true,
  });

  // 🔹 Step 2: เมื่อกด “แก้ไขโปรไฟล์” ให้เปิดแบบฟอร์มกรอกข้อมูล
  if (result.isConfirmed) {
    const { value: formValues } = await Swal.fire({
      title: `<h3 style="margin-bottom: 1rem;">แก้ไขโปรไฟล์ของคุณ</h3>`,
html: `
  <div class="psymeddc-dfg">
    <!-- Sidebar -->
    <div class="psymeddc-profile-sidebar-edit">
      <ul>
        <li class="active" data-section="view">โปรไฟล์</li>
        <li data-section="edit">แก้ไขโปรไฟล์</li>
        <li>รหัสผ่าน</li>
        <li>สิ่งที่ชื่นชอบ</li>
      </ul>
    </div>

    <!-- รูปโปรไฟล์ -->
    <div class="psymeddc-tigerd">
      <img src="${profile.image}" alt="profile" class="psymeddc-profile-img" />
      <p style="margin-top: 10px; font-weight: 500;">รูปโปรไฟล์</p>
      <input type="file" id="image-upload" style="margin-top: 10px;" />
    </div>

    <!-- ช่องกรอกข้อมูล -->
    <div class="psymeddc-profile-info-form">
      <label><span>ชื่อจริง:</span>
        <input id="swal-input1" class="swal2-input" value="${profile.first_name}" />
      </label>
      <label><span>นามสกุล:</span>
        <input id="swal-input2" class="swal2-input" value="${profile.last_name}" />
      </label>
      <label><span>เพศ:</span>
        <input id="swal-input3" class="swal2-input" type="text" value="${profile.gender}" />
      </label>
      <label><span>ที่อยู่:</span>
        <input id="swal-input4" class="swal2-input" value="${profile.address}" />
      </label>
      <label><span>วันเกิด:</span>
        <input id="swal-input5" class="swal2-input" value="${profile.birthday}" />
      </label>
      <label><span>เบอร์โทรศัพท์:</span>
        <input id="swal-input6" class="swal2-input" value="${profile.phone}" />
      </label>
      <label><span>Email:</span>
        <input id="swal-input7" class="swal2-input" value="${profile.email}" readonly />
      </label>
    </div>
  </div>
`,
customClass: { htmlContainer: "xbn-html-wrapper" },
width: "850px",
       didOpen: () => {
  const fileInput = document.getElementById("image-upload") as HTMLInputElement;
  const previewImg = document.querySelector(".xbn-profile-img") as HTMLImageElement;

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        previewImg.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  });
},
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
     preConfirm: async () => {
  const fileInput = document.getElementById("image-upload") as HTMLInputElement;
  //const previewImg = document.getElementById("preview-img") as HTMLImageElement;
  const file = fileInput?.files?.[0] || null;

  let base64Image = profile.image;
  if (file) {
    base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return {
    first_name: (document.getElementById("swal-input1") as HTMLInputElement).value || profile.first_name,
    last_name: (document.getElementById("swal-input2") as HTMLInputElement).value || profile.last_name,
    gender: (document.getElementById("swal-input3") as HTMLInputElement).value || profile.gender,
    address: (document.getElementById("swal-input4") as HTMLInputElement).value || profile.address,
    birthday: (document.getElementById("swal-input5") as HTMLInputElement).value || profile.birthday,
    phone: (document.getElementById("swal-input6") as HTMLInputElement).value || profile.phone,
    email: profile.email,
    image: base64Image, // ✅ base64 image
  };
}


    });
    
    if (formValues) {
      const gender_id = genderReverseMap[formValues.gender] || 3;

      // บันทึกลง localStorage
      localStorage.setItem("first_name", formValues.first_name);
      localStorage.setItem("last_name", formValues.last_name);
      localStorage.setItem("gender", gender_id.toString());
      localStorage.setItem("address", formValues.address);
      localStorage.setItem("birthday", formValues.birthday);
      localStorage.setItem("phone", formValues.phone);
      localStorage.setItem("email", formValues.email);
      localStorage.setItem("profile_image", formValues.image);


      // อัปเดตฐานข้อมูล
      try {
        const response = await fetch("http://localhost:8000/psychologist/update-profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            first_name: formValues.first_name,
            last_name: formValues.last_name,
            gender_id,
            address: formValues.address,
            birthday: formValues.birthday,
            phone: formValues.phone,
            email: formValues.email,
            image: formValues.image,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "อัปเดตข้อมูลไม่สำเร็จ");
        }
         // ✅ โหลดโปรไฟล์ล่าสุดจาก backend แล้วเก็บใหม่ลง localStorage
        await fetchProfileAndUpdateStorage();
        Swal.fire("สำเร็จ", "ข้อมูลโปรไฟล์ถูกอัปเดตแล้ว", "success");
         window.location.reload();
      } catch (err: any) {
        Swal.fire("ผิดพลาด", err.message, "error");
      }
    }
  }
};
  const out = () => {
    localStorage.clear();
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Log out successfully",
      showConfirmButton: false,
      timer: 3000,
    });
    setTimeout(() => navigate("/"), 500);
  };

  return (
  <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
  <img src={healthImage} className="sidebar-logo" alt="logo" />

  <div
    className="sidebar-toggle sidebar-button"
    onClick={() => setIsCollapsed(!isCollapsed)}
  >
    <img
      src="https://cdn-icons-png.flaticon.com/128/1549/1549454.png"
      alt="toggle"
      className={`toggle-icon ${isCollapsed ? "rotate" : ""}`}
    />
  </div>

  <div className="sidebar-menu">
    <div
      className={`sidebar-item ${location.pathname.includes("fill") ? "active" : ""}`}
      onClick={() => handleNavigate("homedoc")}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt="dashboard" />
      {!isCollapsed && <span>Dashboard</span>}
    </div>
    <div
      className={`sidebar-item ${location.pathname.includes("diary") ? "active" : ""}`}
      onClick={() => handleNavigate("diary")}
    >
      <img src=" https://cdn-icons-png.flaticon.com/128/2696/2696455.png" alt="Therapy Case" />
      {!isCollapsed && <span>Therapy Case</span>}
    </div>

    <div
      className={`sidebar-item ${location.pathname.includes("notification") ? "active" : ""}`}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/5001/5001572.png" alt="Notification" />
      {!isCollapsed && <span>Notification</span>}
    </div>

    <div
  className={`sidebar-item ${location.pathname.includes("edit-profile") ? "active" : ""}`}
  onClick={Exchangeprofile}  // ✅ เรียกทันที
>
  <img src="https://cdn-icons-png.flaticon.com/128/9187/9187475.png" alt="Profile" />
  {!isCollapsed && <span>Profile</span>}
</div>

    {showMenu && !isCollapsed && (
      <div className="sidebar-profile-menu">
        <button onClick={Exchangeprofile}>Edit Profile</button>
        <button onClick={out}>Logout</button>
      </div>
    )}
  </div>
<div style={{ marginTop: "auto" , paddingBottom: "2rem"}}>
    <div className="sidebar-divider" />
    <div className="sidebar-item" onClick={out}>
      <img src="https://cdn-icons-png.flaticon.com/128/2529/2529508.png" alt="logout" />
      {!isCollapsed && <span>Log out</span>}
    </div>
  </div>
</div>

  );
}

export default Sidebar;
