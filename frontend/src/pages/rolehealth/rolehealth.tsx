import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./rolehealth.css";
import { useEffect } from "react";
const Rolehealth: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    dob: "",
    phone: "",
    medicalLicense: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "medicalLicense" && value.length > 21) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 1) {
  newErrors.age = "กรุณากรอกอายุ";
}
    if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
    if (!formData.dob) newErrors.dob = "กรุณาเลือกวันเกิด";
   if (!formData.phone.trim()) {
  newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
} else if (!/^0\d{2}-\d{3}-\d{4}$/.test(formData.phone)) {
  newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง ";
}
    if (!formData.medicalLicense.trim()) {
  newErrors.medicalLicense = "กรุณากรอกเลขที่ใบรับรองแพทย์";
} else if (!/^PsychRef\d{3}-\d{3}-\d{3}-\d{4}$/.test(formData.medicalLicense)) {
  newErrors.medicalLicense = "เลขที่ใบรับรองแพทย์ไม่ถูกต้อง ";
}

    if (!attachedFile) {
      newErrors.attachedFile = "กรุณาแนบรูป";
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = "กรุณากรอกอีเมล";
    } else if (
      !/^[A-Z0-9._%+-]+@depressionrec\.go\.th$/i.test(formData.email)
    ) {
      newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
    }
    if (!formData.password) {
      newErrors.password = "กรุณากรอกรหัสผ่าน";
    } else if (!/^psychohealth/i.test(formData.password)) {
      newErrors.password = "รูปแบบรหัสผ่านไม่ถูกต้อง";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    }
    return newErrors;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateStep1();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setStep(2);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationErrors = validateStep2();
  setErrors(validationErrors);

  if (Object.keys(validationErrors).length === 0) {
    try {
      const formPayload = new FormData();

      formPayload.append("firstName", formData.firstName);
      formPayload.append("lastName", formData.lastName);
      formPayload.append("age", formData.age); 
      formPayload.append("dob", formData.dob);
      formPayload.append("phone", formData.phone);
      formPayload.append("medicalLicense", formData.medicalLicense);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);
      // ✅ เพิ่มตรงนี้
      formPayload.append("role_id", "4");
       // ✅ เพิ่ม gender_id แทน gender
      let genderId = "1"; // default male
      if (formData.gender === "female") genderId = "2";
      else if (formData.gender === "other") genderId = "3";
      formPayload.append("gender_id", genderId);
//

      if (attachedFile) {
        formPayload.append("licenseImage", attachedFile);
      }

      const response = await fetch("http://localhost:8000/psychologists/register", {
        method: "POST",
        body: formPayload,
      });

      const data = await response.json();

      if (response.ok) {
  await Swal.fire({
    title: "🎉 ลงทะเบียนสำเร็จ!",
    text: "ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว",
    icon: "success",
    confirmButtonText: "ตกลง",
    timer: 3000,
    showClass: { popup: "animate__animated animate__fadeInDown" },
    hideClass: { popup: "animate__animated animate__fadeOutUp" },
  });

  // ✅ รีเซ็ต state หลังสำเร็จ
  setFormData({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    dob: "",
    phone: "",
    medicalLicense: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  setAttachedFile(null);
  setErrors({});
  setRegisteredEmail(formData.email);
  setStep(3); // แสดงหน้า success
}
        // หรือ navigate("/login");
     else {
        Swal.fire({
          title: "❌ เกิดข้อผิดพลาด",
          text: data.message || "ไม่สามารถลงทะเบียนได้",
          icon: "error",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "❌ เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  }
};



  const handleUploadFile = async () => {
    const { value: file } = await Swal.fire({
      title: "แนบไฟล์รูปภาพใบรับรองแพทย์",
      input: "file",
      inputAttributes: {
        accept: "image/*",
        "aria-label": "Upload your medical license picture",
      },
      showCancelButton: true,
    });

    if (file) {
      const fileObj = file as File;
      setAttachedFile(fileObj);

      const reader = new FileReader();
      reader.onload = (e) => {
        Swal.fire({
          title: "รูปภาพที่คุณแนบ",
          imageUrl: e.target?.result as string,
          imageAlt: "Medical license image",
          confirmButtonText: "ตกลง",
        });
      };
      reader.readAsDataURL(fileObj);

      setErrors((prev) => {
        const updated = { ...prev };
        delete updated["attachedFile"];
        return updated;
      });
    }
  };
const [registeredEmail, setRegisteredEmail] = useState("");

useEffect(() => {
  if (step === 3 && registeredEmail) {
    const ws = new WebSocket("ws://localhost:8000/ws/approval");

    ws.onopen = () => {
      ws.send(JSON.stringify({ email: registeredEmail }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "approved") {
       Swal.fire({
  title: "✅ ได้รับการอนุมัติแล้ว",
  html: `
    <div style="font-size: 1rem; margin-bottom: 1rem;">
      บัญชีของคุณได้รับการอนุมัติเรียบร้อยแล้ว
    </div>
    <div style="font-weight: bold; font-size: 1rem; margin-bottom: 0.5rem;">
      Your Verify Code (PIN):
    </div>
    <div style="
      font-size: 2rem;
      font-weight: 600;
      background: #f2f2f2;
      padding: 0.1rem 1.5rem;
      border-radius: 10px;
      display: inline-block;
      letter-spacing: 2px;
      color: #333;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    ">
      ${data.verify_code}
    </div>
  `,
  icon: "success",
  confirmButtonText: "เข้าสู่ระบบ",
  allowOutsideClick: false,
  allowEscapeKey: false,
  preConfirm: () => {
    navigate("/"); // ⬅️ ปลอดภัยและแน่นอน
  },
});
      }
    };

    return () => {
      ws.close();
    };
  }
}, [step, registeredEmail, navigate]);



  return (
    <div className="rolehealth-background">
    <form
      className="wellness-register-form"
      onSubmit={step === 1 ? handleNext : handleSubmit}
      noValidate
    >
      <h2 className="wellness-heading">ลงทะเบียนนักจิตวิทยา</h2>

      <div className="wellness-steps-after-submit">
  {[1, 2, 3].map((i) => (
    <div key={i} className={`step-box ${step === i ? "active" : ""}`}>
      <img
        className="circle-icon"
        src={
          step === i
            ? "https://cdn-icons-png.flaticon.com/128/14358/14358541.png"
            : "https://cdn-icons-png.flaticon.com/128/481/481078.png"
        }
        alt={`Step ${i}`}
      />
      <p>
        {i === 1
          ? "ข้อมูลส่วนตัว"
          : i === 2
          ? "อีเมลและรหัสผ่าน"
          : "สำเร็จ"}
      </p>
    </div>
  ))}
</div>


      {/* Step 1: Personal Information */}
      {step === 1 && (
        <>
          <label className="wellness-label">
            ชื่อ
            <input
              className="wellness-input"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <div className="wellness-error">{errors.firstName}</div>}
          </label>

          <label className="wellness-label">
            นามสกุล
            <input
              className="wellness-input"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <div className="wellness-error">{errors.lastName}</div>}
          </label>
          <label className="wellness-label">
  อายุ
  <input
    className="wellness-input"
    type="number"
    name="age"
    min="1"
    value={formData.age}
    onChange={handleChange}
  />
  {errors.age && <div className="wellness-error">{errors.age}</div>}
</label>
          <label className="wellness-label">
            เพศ
            <select
              className="wellness-select"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">เลือก</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
            {errors.gender && <div className="wellness-error">{errors.gender}</div>}
          </label>

          <label className="wellness-label">
            วันเกิด
            <input
              className="wellness-input"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
            {errors.dob && <div className="wellness-error">{errors.dob}</div>}
          </label>

          <label className="wellness-label">
  เบอร์โทรศัพท์
  <input
    className="wellness-input"
    type="tel"
    name="phone"
    maxLength={12} // เผื่อขีด
    value={formData.phone}
    onChange={(e) => {
      let raw = e.target.value.replace(/\D/g, "").slice(0, 10); // รับแค่เลข 10 หลัก
      let formatted = raw;
      if (raw.length > 6) {
        formatted = `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
      } else if (raw.length > 3) {
        formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
      }
      setFormData({ ...formData, phone: formatted });

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }}
  />
  {errors.phone && <div className="wellness-error">{errors.phone}</div>}
</label>

<label className="wellness-label">
  เลขที่ใบรับรองแพทย์
  <input
    className="wellness-input"
    type="text"
    name="medicalLicense"
    maxLength={24}
    value={formData.medicalLicense}
    onChange={(e) => {
      let raw = e.target.value.replace(/\D/g, "").slice(0, 13); // เอาเฉพาะตัวเลขหลัง PsychRef
      let formatted = "PsychRef";
      if (raw.length > 9) {
        formatted += `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 9)}-${raw.slice(9)}`;
      } else if (raw.length > 6) {
        formatted += `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
      } else if (raw.length > 3) {
        formatted += `${raw.slice(0, 3)}-${raw.slice(3)}`;
      } else {
        formatted += raw;
      }
      setFormData({ ...formData, medicalLicense: formatted });

      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.medicalLicense;
        return copy;
      });
    }}
  />
  {errors.medicalLicense && <div className="wellness-error">{errors.medicalLicense}</div>}
</label>

          <button
            type="button"
            className="health-btn-upload"
            onClick={handleUploadFile}
            style={{ marginBottom: "0.5rem" }}
          >
            แนบไฟล์รูปใบรับรองแพทย์
          </button>

          {attachedFile && (
            <div style={{ marginBottom: "0.75rem", color: "#226373" }}>
              แนบไฟล์: {attachedFile.name}
            </div>
          )}
          {errors.attachedFile && <div className="wellness-error">{errors.attachedFile}</div>}

          <button className="wellness-submit-button" type="submit">
            ถัดไป
          </button>
          <p className="login-link">
            มีบัญชีผู้ใช้แล้ว? <a href="/">เข้าสู่ระบบ</a>
          </p>
        </>
      )}

      {/* Step 2: Email & Password */}
      {step === 2 && (
        <>
          <label className="wellness-label">
            อีเมล
            <input
              className="wellness-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="wellness-error">{errors.email}</div>}
          </label>

          <label className="wellness-label">
            รหัสผ่าน
            <input
              className="wellness-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="wellness-error">{errors.password}</div>}
          </label>

          <label className="wellness-label">
            ยืนยันรหัสผ่าน
            <input
              className="wellness-input"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && <div className="wellness-error">{errors.confirmPassword}</div>}
          </label>

          <button
            className="wellness-submit-button"
            type="button"
            onClick={() => setStep(1)}
            style={{ marginRight: "1rem" }}
          >
            ย้อนกลับ
          </button>

          <button className="wellness-submit-button" type="submit">
            ลงทะเบียน
          </button>
        </>
      )}

     
{step === 3 && (
  <div className="success-page">
    <h3 className="success-message">📩 รอการอนุมัติจากแอดมิน</h3>
    <p className="success-subtext">
      ขอบคุณสำหรับการลงทะเบียน กรุณารอสักครู่ ระบบจะนำคุณไปยังหน้าหลักหลังได้รับการอนุมัติ
    </p>
  </div>
)}



    </form>
    </div>
  );
};
export default Rolehealth;
