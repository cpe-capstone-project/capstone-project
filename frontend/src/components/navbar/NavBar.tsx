import { useNavigate, useLocation } from "react-router";
import { useEffect, useState } from "react";
import "./Navbar.css";
import Swal from "sweetalert2";
import healthImage from "../../assets/med5.png";

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
  const [hasNotice, setHasNotice] = useState(localStorage.getItem("has_new_notice") === "true");
  const [, setNoticeList] = useState(() => {
    const stored = localStorage.getItem("patient_notifications");
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ อัปเดตทุกวินาทีเพื่อตรวจ flag ใหม่
  useEffect(() => {
    const interval = setInterval(() => {
      const isNew = localStorage.getItem("has_new_notice") === "true";
      setHasNotice(isNew);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

      // 🔹 อัปเดต calendar_events
      const calendar = JSON.parse(localStorage.getItem("calendar_events") || "[]");
      const updatedCalendar = calendar.map((ev: any) =>
        ev.id === Number(id) ? { ...ev, status } : ev
      );
      localStorage.setItem("calendar_events", JSON.stringify(updatedCalendar));

      // 🔹 อัปเดต patient_notifications
      const noticeList = JSON.parse(localStorage.getItem("patient_notifications") || "[]");
      const updatedNoticeList = noticeList.map((notice: any) =>
        notice.appointment_id === Number(id) ? { ...notice, status } : notice
      );
      localStorage.setItem("patient_notifications", JSON.stringify(updatedNoticeList));

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

      const existing = JSON.parse(localStorage.getItem("patient_notifications") || "[]");
      const updated = [...existing, {
        start_time: data.start_time,
        end_time: data.end_time,
        detail: data.detail,
        appointment_id: data.appointment_id,
      }];
      localStorage.setItem("patient_notifications", JSON.stringify(updated));
      localStorage.setItem("has_new_notice", "true");
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
      <div class="xbn-popup">
       <div class="xbn-popup">
  <!-- Sidebar ด้านซ้าย -->
  <div class="xbn-profile-sidebar">
    <ul>
       <li class="active" data-section="view">โปรไฟล์</li>
    <li data-section="edit">แก้ไขโปรไฟล์</li>
      <li>รหัสผ่าน</li>
      <li>สิ่งที่ชื่นชอบ</li>
    </ul>
  </div>
        <div class="xbn-profile-center">
          <img src="${profile.image}" alt="profile" class="xbn-profile-img" />
          <p style="margin-top: 10px; font-weight: 500;">รูปโปรไฟล์</p>
        </div>
   <div class="xbn-profile-info">
  <div class="xbn-profile-row two-col">
    <div><b>ชื่อ:</b> ${profile.first_name}</div>
    <div><b>นามสกุล:</b> ${profile.last_name}</div>
  </div>
  <div class="xbn-profile-row">
    <div><b>เพศ:</b> ${profile.gender}</div>
  </div>
  <div class="xbn-profile-row">
    <div><b>ที่อยู่:</b> ${profile.address}</div>
  </div>
  <div class="xbn-profile-row">
    <div><b>วันเกิด:</b> ${profile.birthday}</div>
  </div>
  <div class="xbn-profile-row">
    <div><b>เบอร์โทรศัพท์:</b> ${profile.phone}</div>
  </div>
  <div class="xbn-profile-row">
    <div><b>Email:</b> ${profile.email}</div>
  </div>
</div>


      </div>
    `,
    customClass: { htmlContainer: "xbn-html-wrapper" },
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
  <div class="dfg">
  <!-- Sidebar ด้านซ้าย -->
  <div class="xbn-profile-sidebar-edit">
    <ul>
       <li class="active" data-section="view">โปรไฟล์</li>
    <li data-section="edit">แก้ไขโปรไฟล์</li>
      <li>รหัสผ่าน</li>
      <li>สิ่งที่ชื่นชอบ</li>
    </ul>
  </div>

  <!-- รูปโปรไฟล์ตรงกลาง -->
  <div class="tigerd">
    <img src="${profile.image}" alt="profile" class="xbn-profile-img" />
    <p style="margin-top: 10px; font-weight: 500;">รูปโปรไฟล์</p>
    <input type="file" id="image-upload" style="margin-top: 10px;" />
  </div>

  <!-- ช่องกรอกข้อมูล -->
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
      preConfirm: () => {
  const previewImg = document.querySelector(".xbn-profile-img") as HTMLImageElement;
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
        const response = await fetch("http://localhost:8000/patient/update-profile", {
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
     // ✅ เก็บค่า loginHistory และ currentLoginUser ไว้
  const historyKeys = Object.keys(localStorage).filter(key =>
     key.startsWith("loginHistory-") || key === "currentLoginUser" ||
  key === "patient_notifications" || key === "has_new_notice"
);
  const historyData: Record<string, string> = {};
  for (const key of historyKeys) {
    historyData[key] = localStorage.getItem(key)!;
  }

  // 🔥 ลบทุกค่า
  localStorage.clear();

  // ✅ คืนค่าประวัติ login กลับไป
  for (const key in historyData) {
    localStorage.setItem(key, historyData[key]);
  }
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
          <a onClick={() => handleNavigate("")}>Dashboard</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("home")}>Management</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("diary")}>Diary</a>
        </li>
        <li>
          <a onClick={() => handleNavigate("thought")}>Thought Record</a>
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
