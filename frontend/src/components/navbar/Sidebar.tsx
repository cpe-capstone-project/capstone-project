import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import Swal from "sweetalert2";
import "./Sidebar.css";
import healthImage from "../../assets/med5.png";
import { k, KEYS } from "../../unid/storageKeys";


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const PROFILE_KEY = k(KEYS.PROFILE_PSYCH);

const getProfileFromLS = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
  catch { return {}; }
};
  const handleNavigate = (path: string) => {
    const basePath = location.pathname.split("/")[1];
    navigate(`/${basePath}/${path}`);
  };
const normalizeImageUrl = (img?: string) => {
  if (!img) return "";
  // ถ้าเป็น data URL ให้ใช้ตรง ๆ
  if (img.startsWith("data:")) return img;
  // ถ้าเป็น absolute URL แล้ว ให้ใช้เลย
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  // ถ้าเป็น path สั้นจาก backend ให้เติมโฮสต์
  return `http://localhost:8000/${img.replace(/^\/?/, "")}`;
};

const normalizePsychProfile = (raw: any) => {
  // รองรับ snake_case / camelCase / PascalCase
  const first_name =
    raw.first_name ?? raw.firstName ?? raw.FirstName ?? "";
  const last_name  =
    raw.last_name  ?? raw.lastName  ?? raw.LastName  ?? "";
  const gender =
    raw.gender ?? raw.gender_id ?? raw.genderId ?? raw.GenderID ?? raw.Gender ?? "";
  const address =
    raw.address ?? raw.Address ?? "";
  const birthday =
    raw.birthday ?? raw.date_of_birth ?? raw.dob ?? raw.Birthday ?? "";
  const phone =
    raw.phone ?? raw.tel ?? raw.Phone ?? "";
  const email =
    raw.email ?? raw.Email ?? "";
  const imageRaw =
    raw.image ?? raw.profile_image ?? raw.license_image ?? raw.licenseImage ?? raw.LicenseImage ?? "";

  const image = normalizeImageUrl(imageRaw);

  return { first_name, last_name, gender, address, birthday, phone, email, image };
};

const fetchProfileAndUpdateStorage = async () => {
  try {
    const res = await fetch("http://localhost:8000/psychologist/profile", {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      // 🔹 รองรับกรณี backend ห่อข้อมูล
      const src =
        (data && (data.data || data.profile || data.result)) ?? data ?? {};

      const p = normalizePsychProfile(src);

      // เก็บ generic (เผื่อคอมโพเนนท์เก่าใช้)
      localStorage.setItem("first_name", p.first_name || "");
      localStorage.setItem("last_name",  p.last_name  || "");
      localStorage.setItem("gender",     String(p.gender ?? ""));
      localStorage.setItem("address",    p.address || "");
      localStorage.setItem("birthday",   p.birthday || "");
      localStorage.setItem("phone",      p.phone || "");
      localStorage.setItem("email",      p.email || "");
      localStorage.setItem("profile_image", p.image || "");

      // ✅ เก็บ cache หลัก
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));

      // (แนะนำ) debug ชั่วคราว
      console.log("[PSY] api raw:", data);
      console.log("[PSY] src used:", src);
      console.log("[PSY] normalized:", p);
      console.log("[PSY] saved under:", PROFILE_KEY, localStorage.getItem(PROFILE_KEY));
    } else {
      console.error("fetch profile failed", data);
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
  await fetchProfileAndUpdateStorage();

  let p = getProfileFromLS();

  // 🔹 ถ้ายังว่างมาก ๆ ลอง fallback ไปยัง generic keys
  if (!p || Object.keys(p).length === 0) {
    p = {
      first_name: localStorage.getItem("first_name") || "",
      last_name:  localStorage.getItem("last_name")  || "",
      gender:     localStorage.getItem("gender")     || "",
      address:    localStorage.getItem("address")    || "",
      birthday:   localStorage.getItem("birthday")   || "",
      phone:      localStorage.getItem("phone")      || "",
      email:      localStorage.getItem("email")      || "",
      image:      localStorage.getItem("profile_image") || "",
    };
  }

  const profile = {
    first_name: p.first_name || "-",
    last_name:  p.last_name  || "-",
    address:    p.address    || "-",
    birthday:   p.birthday   || "-",
    email:      p.email      || "-",
    phone:      p.phone      || "-",
    image:      p.image || "https://cdn-icons-png.flaticon.com/128/1430/1430402.png",
    gender:     genderMap[String(p.gender)] || "-",
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
  const profileKey = PROFILE_KEY;
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
    profileKey,
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
      onClick={() => handleNavigate("")}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/1946/1946488.png" alt="" />
      {!isCollapsed && <span>Dashboard</span>}
    </div>
    <div
      className={`sidebar-item ${location.pathname.includes("fill") ? "active" : ""}`}
      onClick={() => handleNavigate("homedoc")}
    >
      <img src="https://cdn-icons-png.flaticon.com/128/11450/11450628.png" alt="dashboard" />
      {!isCollapsed && <span>Main Menu</span>}
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
