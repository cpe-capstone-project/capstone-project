import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import "./Navbar.css";
import Swal from "sweetalert2";
import healthImage from "../../assets/med5.png";
import { k, KEYS } from "../../unid/storageKeys";
const NOTI_KEY = k(KEYS.NOTI);
const NOTICE_FLAG_KEY = k(KEYS.NOTICE_FLAG);
const PROFILE_KEY = k(KEYS.PROFILE);
const CAL_KEY = k(KEYS.CAL);    
// ✅ เพิ่ม global function
declare global {
  interface Window {
    confirmAppointment: (id: string, status: string) => void;
  }
}

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [hasNotice, setHasNotice] = useState(localStorage.getItem(NOTICE_FLAG_KEY) === "true");
const [, setNoticeList] = useState(() => {
  const stored = localStorage.getItem(NOTI_KEY);
  return stored ? JSON.parse(stored) : [];
});

  // ✅ อัปเดตทุกวินาทีเพื่อตรวจ flag ใหม่
  useEffect(() => {
   // เดิม: "has_new_notice"
const interval = setInterval(() => {
  const isNew = localStorage.getItem(NOTICE_FLAG_KEY) === "true";
  setHasNotice(isNew);
}, 1000);

    return () => clearInterval(interval);
  }, []);
// helper บนสุดของไฟล์ (ใต้ const ต่าง ๆ)
const getProfileFromLS = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
  catch { return {}; }
};
const getProfileImage = () => {
  const p = getProfileFromLS();
  return p.image || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png";
};

useEffect(() => {
  window.confirmAppointment = async (id: string, status: string) => {
    try {
      // 🔹 อัปเดต API
      const res = await fetch("http://localhost:8000/appointments/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: Number(id),
          status,
        }),
      });

      if (!res.ok) throw new Error("อัปเดตสถานะล้มเหลว");

      Swal.fire("สำเร็จ", status === "accepted" ? "ยืนยันนัดแล้ว" : "ปฏิเสธนัดแล้ว", "success");

       // ✅ calendar events ต่อผู้ใช้
    const calendar = JSON.parse(localStorage.getItem(CAL_KEY) || "[]");
    const updatedCalendar = calendar.map((ev: any) =>
      ev.id === Number(id) ? { ...ev, status } : ev
    );
    localStorage.setItem(CAL_KEY, JSON.stringify(updatedCalendar));

    // ✅ patient notifications ต่อผู้ใช้
    const noticeList = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
    const updatedNoticeList = noticeList.map((notice: any) =>
      notice.appointment_id === Number(id) ? { ...notice, status } : notice
    );
    localStorage.setItem(NOTI_KEY, JSON.stringify(updatedNoticeList));

      window.dispatchEvent(new Event("calendarEventsUpdated"));
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.message || "ไม่สามารถอัปเดตสถานะได้", "error");
    }
  };
}, []);

useEffect(() => {
  const id = localStorage.getItem("id");
  if (!id) return;

  const socket = new WebSocket(`ws://localhost:8000/ws/${id}`);
  socket.onopen = () => console.log("✅ WebSocket opened");
  socket.onerror = (err) => console.error("❌ WebSocket error", err);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "appointment_created") {
      console.log("🔥 ได้รับนัดหมายใหม่");

      const existing = JSON.parse(localStorage.getItem(NOTI_KEY) || "[]");
      const updated = [...existing, {
        start_time: data.start_time,
        end_time: data.end_time,
        detail: data.detail,
        appointment_id: data.appointment_id,
      }];
      localStorage.setItem(NOTI_KEY, JSON.stringify(updated));
localStorage.setItem(NOTICE_FLAG_KEY, "true");

      setNoticeList(updated);
      setHasNotice(true);

      // ✅ แสดง Swal แจ้งเตือนแบบตอบกลับได้
      const htmlContent = `
        <div style="background-color: #e0f2ff; padding: 20px; border-radius: 16px; text-align: left;">
          <h3 style="margin-bottom: 15px; text-align: center;">
            <img src="https://cdn-icons-png.flaticon.com/128/10215/10215675.png" width="32" style="vertical-align: middle; margin-right: 8px;" />
            แจ้งเตือนนัดหมาย
          </h3>

          <div style="background: white; padding: 10px 16px; border-radius: 12px; margin-bottom: 10px; font-size: 0.9rem;">
            <div><b>ปรึกษาแพทย์</b> เวลานัด: ${new Date(data.start_time).toLocaleDateString()} 
              ${new Date(data.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${new Date(data.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} น.
            </div>
            <div><b>รายละเอียด:</b> ${data.detail}</div>
          </div>
        </div>
      `;

      Swal.fire({
        html: htmlContent,
        width: 600,
        showCancelButton: true,
        confirmButtonText: "ยืนยันการนัด",
        cancelButtonText: "ปฏิเสธการนัด",
        showCloseButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.confirmAppointment(data.appointment_id, "accepted");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          window.confirmAppointment(data.appointment_id, "rejected");
        }
      });
    }
  };

  return () => socket.close();
}, []);


  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };
  const fetchProfileAndUpdateStorage = async () => {
  try {
    const res = await fetch("http://localhost:8000/patient/profile", {
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
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
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
const handleEditProfile = async () => {
  setShowMenu(false);
  await fetchProfileAndUpdateStorage();
    const raw = localStorage.getItem(PROFILE_KEY);
  const p = raw ? JSON.parse(raw) : {};

  const profile = {
    first_name: p.first_name || "-",
    last_name:  p.last_name  || "-",
    address:    p.address    || "-",
    birthday:   p.birthday   || "-",
    email:      p.email      || "-",
    phone:      p.phone      || "-",
    image:      p.image || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png",
    gender:     genderMap[String(p.gender)] || "-", // ถ้า backend ส่งเป็นเลข 1/2/3
  };

  const { value: formValues } = await Swal.fire({
    title: `<h3 style="margin-bottom: 1rem;">โปรไฟล์ของคุณ</h3>`,
    html: `
       <div class="dfg">
    <!-- Sidebar -->
    <div class="xbn-profile-sidebar-edit">
      <ul>
        <li class="active" data-section="view">
          <img src="https://cdn-icons-png.flaticon.com/128/3177/3177440.png"" class="xbn-sidebar-icon"/>
          โปรไฟล์
        </li>
        <li data-section="edit">
          <img src="https://cdn-icons-png.flaticon.com/128/1828/1828270.png" class="xbn-sidebar-icon"/>
          แก้ไขโปรไฟล์
        </li>
      </ul>
    </div>

    <!-- Section: View -->
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
    customClass: { htmlContainer: "xbn-html-wrapper" },
    width: "850px",
    showCancelButton: true,
    confirmButtonText: "บันทึก",
    cancelButtonText: "ยกเลิก",
   didOpen: () => {
  // toggle tabs
  document.querySelectorAll(".xbn-profile-sidebar-edit li").forEach(li => {
    li.addEventListener("click", () => {
      document.querySelectorAll(".xbn-profile-sidebar-edit li").forEach(x => x.classList.remove("active"));
      li.classList.add("active");
      const section = li.getAttribute("data-section");
      (document.querySelector(".section-view") as HTMLElement).style.display = section === "view" ? "block" : "none";
      (document.querySelector(".section-edit") as HTMLElement).style.display = section === "edit" ? "block" : "none";
    });
  });

// === อัปโหลดรูปจากเครื่อง ===
const pickBtn   = document.getElementById("pick-image") as HTMLButtonElement;
const fileInput = document.getElementById("image-upload") as HTMLInputElement;
const preview   = document.getElementById("profile-preview") as HTMLImageElement;

// เปิด file picker เมื่อคลิกปุ่ม
pickBtn?.addEventListener("click", () => fileInput?.click());

// พรีวิวภาพทันทีที่เลือก
fileInput?.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  // อ่านเป็น base64 เพื่อนำไปแสดง/บันทึก
  const reader = new FileReader();
  reader.onload = () => { preview.src = reader.result as string; };
  reader.readAsDataURL(file);
});
},
    preConfirm: () => {
      const previewImg = document.querySelector(".section-edit .xbn-profile-img") as HTMLImageElement;
      return {
        first_name: (document.getElementById("swal-input1") as HTMLInputElement).value,
        last_name: (document.getElementById("swal-input2") as HTMLInputElement).value,
        gender: (document.getElementById("swal-input3") as HTMLInputElement).value,
        address: (document.getElementById("swal-input4") as HTMLInputElement).value,
        birthday: (document.getElementById("swal-input5") as HTMLInputElement).value,
        phone: (document.getElementById("swal-input6") as HTMLInputElement).value,
        email: profile.email,
        image: previewImg?.src || profile.image,
      };
    }
  });

  if (formValues) {
    // ✅ บันทึก localStorage และส่งไป backend
    const gender_id = genderReverseMap[formValues.gender] || 3;
    localStorage.setItem("first_name", formValues.first_name);
    localStorage.setItem("last_name", formValues.last_name);
    localStorage.setItem("gender", gender_id.toString());
    localStorage.setItem("address", formValues.address);
    localStorage.setItem("birthday", formValues.birthday);
    localStorage.setItem("phone", formValues.phone);
    localStorage.setItem("email", formValues.email);
    localStorage.setItem("profile_image", formValues.image);

    try {
      const res = await fetch("http://localhost:8000/patient/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...formValues, gender_id }),
      });
      if (!res.ok) throw new Error("อัปเดตไม่สำเร็จ");
      await fetchProfileAndUpdateStorage();
      Swal.fire("สำเร็จ", "โปรไฟล์อัปเดตแล้ว", "success").then(() => window.location.reload());
    } catch (err: any) {
      Swal.fire("ผิดพลาด", err.message, "error");
    }
  }
};


const out = () => {
  const keepKeys = new Set<string>([
    "currentLoginUser",
    ...Object.keys(localStorage).filter((key) => key.startsWith("loginHistory-")),

    k(KEYS.NOTI),            // patient_notifications:<uid>
    k(KEYS.NOTICE_FLAG),     // has_new_notice:<uid>
    k(KEYS.CAL),             // calendar_events:<uid>
    k(KEYS.CHECK_DAY),       // daily-checklist-v2:<uid>
    k(KEYS.CHECK_BYDATE),    // daily-checklist-bydate-v2:<uid>
  ]);

  const backup: Record<string, string> = {};
  for (const key of keepKeys) {
    const v = localStorage.getItem(key);
    if (v !== null) backup[key] = v;
  }

  localStorage.clear();

  for (const [key, v] of Object.entries(backup)) {
    localStorage.setItem(key, v);
  }

  const Toast = Swal.mixin({ toast:true, position:"top-end", showConfirmButton:false, timer:3000, timerProgressBar:true,
    didOpen:(t)=>{ t.onmouseenter = Swal.stopTimer; t.onmouseleave = Swal.resumeTimer; }});
  Toast.fire({ icon:"success", title:"Log out successfully" });
  setTimeout(() => navigate("/"), 500);
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
          <a onClick={() => handleNavigate("thought_records")}>Thought Record</a>
        </li>
   <li style={{ position: "relative" }}>
  <img
    src="https://cdn-icons-png.flaticon.com/128/10099/10099006.png"
    alt="แจ้งเตือน"
    width="24"
    height="24"
    style={{ cursor: "default" }} // เปลี่ยนจาก pointer → default เพื่อให้รู้ว่าไม่ได้คลิก
  />
  {hasNotice && (
    <span
      style={{
        position: "absolute",
        top: 2,
        right: 2,
        backgroundColor: "red",
        color: "white",
        borderRadius: "50%",
        width: 10,
        height: 10,
      }}
    />
  )}
</li>



        <div style={{ position: "relative" }}>
         <img
  className="profile"
  src={getProfileImage()}
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
