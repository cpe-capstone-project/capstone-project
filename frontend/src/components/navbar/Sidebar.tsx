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
    image:
      localStorage.getItem("profile_image") ||
      "https://cdn-icons-png.flaticon.com/128/1430/1430402.png",
    gender: genderMap[localStorage.getItem("gender") || ""] || "-",
  };

  const { value: formValues } = await Swal.fire({
    title: `<h3 style="margin-bottom: 1rem;">โปรไฟล์ของคุณ</h3>`,
    html: `
      <div class="dfg">
        <!-- Sidebar -->
        <div class="xbn-profile-sidebar-edit">
          <ul>
            <li class="active" data-section="view">
              <img src="https://cdn-icons-png.flaticon.com/128/3177/3177440.png" class="xbn-sidebar-icon"/>
              โปรไฟล์
            </li>
            <li data-section="edit">
              <img src="https://cdn-icons-png.flaticon.com/128/1828/1828270.png" class="xbn-sidebar-icon"/>
              แก้ไขโปรไฟล์
            </li>
          </ul>
        </div>

        <!-- View -->
        <div class="xbn-content section-view">
          <div class="xbn-profile-header">
            <img src="${profile.image}" alt="profile" class="xbn-profile-img"/>
            <h4>${profile.first_name} ${profile.last_name}</h4>
             <p class="xbn-email">
  <img src="https://cdn-icons-png.flaticon.com/128/732/732200.png" class="xbn-detail-icon" alt="mail"/>
  <span>${profile.email || "-"}</span>
</p>
          </div>
          <div class="xbn-profile-details">
            <div><b>เพศ:</b> ${profile.gender}</div>
            <div><b>วันเกิด:</b> ${profile.birthday}</div>
            <div><b>ที่อยู่:</b> ${profile.address}</div>
            <div><b>เบอร์โทรศัพท์:</b> ${profile.phone}</div>
          </div>
        </div>

        <!-- Edit -->
        <div class="xbn-content section-edit" style="display:none;">
          <div class="tigerd">
            <div class="preview-frame">
              <img src="${profile.image}" alt="profile" class="xbn-profile-img" id="profile-preview"/>
            </div>
            <button type="button" id="pick-image" class="img-upload-btn">เปลี่ยนรูปโปรไฟล์</button>
            <input type="file" id="image-upload" accept="image/*" style="display:none" />
            <small class="img-hint">รองรับ JPG/PNG</small>
          </div>

          <div class="xbn-profile-info-form">
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
      </div>
    `,
    customClass: { popup: "xbn-swal", htmlContainer: "xbn-html-wrapper" },
    width: "850px",
    showCancelButton: true,
    confirmButtonText: "บันทึก",
    cancelButtonText: "ยกเลิก",
    didOpen: () => {
      // toggle tab
      document.querySelectorAll(".xbn-profile-sidebar-edit li").forEach((li) => {
        li.addEventListener("click", () => {
          document
            .querySelectorAll(".xbn-profile-sidebar-edit li")
            .forEach((x) => x.classList.remove("active"));
          li.classList.add("active");
          const section = li.getAttribute("data-section");
          (document.querySelector(".section-view") as HTMLElement).style.display =
            section === "view" ? "block" : "none";
          (document.querySelector(".section-edit") as HTMLElement).style.display =
            section === "edit" ? "block" : "none";
        });
      });

      // upload preview
      const pickBtn = document.getElementById("pick-image") as HTMLButtonElement;
      const fileInput = document.getElementById("image-upload") as HTMLInputElement;
      const preview = document.getElementById("profile-preview") as HTMLImageElement;

      pickBtn?.addEventListener("click", () => fileInput?.click());
      fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => { preview.src = reader.result as string; };
        reader.readAsDataURL(file);
      });
    },
    preConfirm: () => {
      const previewImg = document.querySelector(".section-edit .xbn-profile-img") as HTMLImageElement;
      return {
        first_name: (document.getElementById("swal-input1") as HTMLInputElement).value || profile.first_name,
        last_name: (document.getElementById("swal-input2") as HTMLInputElement).value || profile.last_name,
        gender: (document.getElementById("swal-input3") as HTMLInputElement).value || profile.gender,
        address: (document.getElementById("swal-input4") as HTMLInputElement).value || profile.address,
        birthday: (document.getElementById("swal-input5") as HTMLInputElement).value || profile.birthday,
        phone: (document.getElementById("swal-input6") as HTMLInputElement).value || profile.phone,
        email: profile.email,
        image: previewImg?.src || profile.image,
      };
    },
  });

  if (!formValues) return;

  // map gender -> id
  const gender_id = genderReverseMap[formValues.gender] ?? 3;

  // อัปเดต localStorage
  localStorage.setItem("first_name", formValues.first_name);
  localStorage.setItem("last_name", formValues.last_name);
  localStorage.setItem("gender", String(gender_id));
  localStorage.setItem("address", formValues.address);
  localStorage.setItem("birthday", formValues.birthday);
  localStorage.setItem("phone", formValues.phone);
  localStorage.setItem("email", formValues.email);
  localStorage.setItem("profile_image", formValues.image);

  // เรียก API ฝั่งนักจิตฯ
  try {
    const res = await fetch("http://localhost:8000/psychologist/update-profile", {
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "อัปเดตไม่สำเร็จ");
    }

    // ดึงโปรไฟล์ล่าสุดมา sync อีกครั้ง (ถ้าต้องการ)
    await fetchProfileAndUpdateStorage();

    await Swal.fire("สำเร็จ", "โปรไฟล์อัปเดตแล้ว", "success");
    window.location.reload();
  } catch (e:any) {
    Swal.fire("ผิดพลาด", e.message || "อัปเดตไม่สำเร็จ", "error");
  }
};

 const out = () => {
  const KEYS_TO_REMOVE = [
    "isLogin",
    "token_type",
    "token",
    "id",
    "role",
    "email",
    "first_name",
    "last_name",
    "gender",
    "address",
    "birthday",
    "phone",
    "profile_image",
    "currentLoginUser",
    // ถ้ามี key อื่นที่เป็นข้อมูล session ก็เติมได้
  ];

  KEYS_TO_REMOVE.forEach((k) => localStorage.removeItem(k));

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
      className={`sidebar-item ${location.pathname.includes("therapy") ? "active" : ""}`}
      onClick={() => handleNavigate("therapy")}
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
