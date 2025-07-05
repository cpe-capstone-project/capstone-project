import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./rolehealth.css";


const Rolehealth: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
    if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
    if (!formData.dob) newErrors.dob = "กรุณาเลือกวันเกิด";
    if (!formData.phone.trim()) {
      newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
    }
    if (!formData.medicalLicense.trim()) {
      newErrors.medicalLicense = "กรุณากรอกเลขที่ใบรับรองแพทย์";
    } else if (!/^PsychRef\d{13}$/.test(formData.medicalLicense)) {
      newErrors.medicalLicense = "เลขที่ใบรับรองแพทย์ไม่ถูกต้อง";
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
      formPayload.append("gender", formData.gender);
      formPayload.append("dob", formData.dob);
      formPayload.append("phone", formData.phone);
      formPayload.append("medicalLicense", formData.medicalLicense);
      formPayload.append("email", formData.email);
      formPayload.append("password", formData.password);

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
        setStep(3);
        // หรือ navigate("/login");
      } else {
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

  return (
    <div className="rolehealth-background">
    <form
      className="wellness-register-form"
      onSubmit={step === 1 ? handleNext : handleSubmit}
      noValidate
    >
      <h2 className="wellness-heading">ลงทะเบียนนักจิตวิทยา</h2>

      <div className="wellness-steps-after-submit">
        <div className={`step-box ${step === 1 ? "active" : ""}`}>
          <div className="circle">1</div>
          <p>ข้อมูลส่วนตัว</p>
        </div>
        <div className={`step-box ${step === 2 ? "active" : ""}`}>
          <div className="circle">2</div>
          <p>อีเมลและรหัสผ่าน</p>
        </div>
        <div className={`step-box ${step === 3 ? "active" : ""}`}>
          <div className="circle">3</div>
          <p>สำเร็จ</p>
        </div>
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
              value={formData.phone}
              maxLength={10}
              onChange={handleChange}
            />
            {errors.phone && <div className="wellness-error">{errors.phone}</div>}
          </label>

          <label className="wellness-label">
            เลขที่ใบรับรองแพทย์
            <input
              className="wellness-input"
              type="text"
              name="medicalLicense"
              value={formData.medicalLicense}
              onChange={handleChange}
              maxLength={21}
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

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="success-page">
          <h3 className="success-message">🎉 การลงทะเบียนเสร็จสมบูรณ์</h3>
          <p className="success-subtext">ขอบคุณที่ลงทะเบียนกับเรา</p>
          <button
            className="wellness-submit-button"
            onClick={() => navigate("/")}
          >
            ไปหน้าหลัก
          </button>
        </div>
      )}
    </form>
    </div>
  );
};

export default Rolehealth;
