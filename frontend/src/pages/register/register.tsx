import React, { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./register.css";
import privacyImage from "../../assets/privacy.png";


const Register: React.FC = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"TH" | "EN">("TH");

  const [step, setStep] = useState(1);
  console.log("STEP =", step);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
     age: "", // 👈 เพิ่มตรงนี้
    gender: "",
    address: "",
    dob: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    consent: false,
    verifyCode: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const target = e.target;
  const name = target.name;
  const value =
    target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : target.value;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setErrors((prev) => {
    const copy = { ...prev };
    delete copy[name];
    return copy;
  });
};


  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "กรุณากรอกชื่อ";
    if (!formData.lastName.trim()) newErrors.lastName = "กรุณากรอกนามสกุล";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 1)
  newErrors.age = "กรุณากรอกอายุ";
    if (!formData.gender) newErrors.gender = "กรุณาเลือกเพศ";
    if (!formData.address.trim()) newErrors.address = "กรุณากรอกที่อยู่";
    if (!formData.dob) newErrors.dob = "กรุณาเลือกวันเกิด";
   const rawPhone = formData.phone.replace(/-/g, ""); // เอาขีดออกก่อน
if (!/^0\d{9}$/.test(rawPhone)) {
  newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง";
}
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!/^[\w.-]+@gmail\.com$/.test(formData.email)) newErrors.email = "รูปแบบ email ไม่ถูกต้อง";
    if (!formData.password) newErrors.password = "กรุณากรอกรหัสผ่าน";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    return newErrors;
  };

  const validateStep3 = () => {
  const errors: { [key: string]: string } = {};
  if (!formData.consent) {
    errors.consent = "กรุณายอมรับนโยบายความเป็นส่วนตัว";
  }
  return errors;
};
const policyItems = {
  TH: [
    "การเก็บข้อมูลส่วนบุคคลเพื่อบริการ CBT",
    "การจัดเก็บข้อมูลอย่างปลอดภัยและการจำกัดการเข้าถึง",
    "ไม่เปิดเผยข้อมูลโดยไม่ได้รับความยินยอม (ยกเว้นตามกฎหมาย)",
    "สิทธิของผู้ใช้: เข้าถึง แก้ไข หรือลบข้อมูล",
    "การใช้แอปฯ ถือเป็นการให้ความยินยอม"
  ],
  EN: [
    "Personal Data Collection for CBT Services",
    "Secure Storage and Restricted Access",
    "No Disclosure Without Consent (Except by Law)",
    "User Rights: Access, Edit, or Delete Data",
    "Consent Implied by App Usage"
  ]
};
const validateStep4 = () => {
  const newErrors: { [key: string]: string } = {};

  if (!/^\d{6}$/.test(formData.verifyCode)) {
    newErrors.verifyCode = "กรุณากรอก PIN ที่ถูกต้อง";
  }

  return newErrors;
};



  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    let validationErrors = {};
    if (step === 1) validationErrors = validateStep1();
    else if (step === 2) validationErrors = validateStep2();
    else if (step === 3) validationErrors = validateStep3();
     else if (step === 4) validationErrors = validateStep4();

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) setStep(step + 1);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const allErrors = {
    ...validateStep1(),
    ...validateStep2(),
    ...validateStep3(),
    ...validateStep4(),
  };
  setErrors(allErrors);

  if (Object.keys(allErrors).length === 0) {
    try {
      // ✅ ตรวจสอบ PIN ก่อน
      const verifyCodeRes = await fetch("http://localhost:8000/verify-psychologist-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: formData.verifyCode }),
      });
      const verifyResult = await verifyCodeRes.json();

      if (!verifyCodeRes.ok) {
        Swal.fire("❌ PIN ไม่ถูกต้อง", verifyResult.error || "กรุณาตรวจสอบกับนักจิตอีกครั้ง", "error");
        return;
      }
      const psychologistId = verifyResult.psychologist_id; // ✅ เก็บ ID นักจิตจาก backend

      // ✅ สมัครจริง
      const dataToSend = {
  first_name: formData.firstName,
  last_name: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  age: Number(formData.age),
  birthday: new Date(formData.dob).toISOString(),
  password: formData.password,
  picture: "https://i.imgur.com/default-avatar.png", // หรือใส่ path จริง
  gender_id:
    formData.gender === "male"
      ? 1
      : formData.gender === "female"
      ? 2
      : 3,
  role_id: 3, // Patient
  consent: formData.consent,
  address: formData.address,
  psychologist_id: psychologistId,
};


      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "🎉 ลงทะเบียนสำเร็จ!",
          text: "ระบบได้บันทึกข้อมูลของคุณเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          timer: 3000,
        });
        setStep(5);
      } else {
        Swal.fire("❌ เกิดข้อผิดพลาด", data.error || "ไม่สามารถลงทะเบียนได้", "error");
      }
    } catch (error) {
      Swal.fire("❌ เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "error");
    }
  }
};




  return (
    <div className="bmser-background">
    <form className="registermed" onSubmit={handleSubmit} noValidate>
      <h2>ลงทะเบียนผู้ป่วย</h2>
   <div className="yakno">
  {[1, 2, 3, 4 ,5].map((i) => (
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
          : i === 3
          ? "ยืนยันข้อมูล"
          : i === 4
          ? "Verify Code"
          : "สำเร็จ"}
      </p>
    </div>
  ))}
</div>



      {/* STEP 1 */}
      {step === 1 && (
        
        <>
          <label className="input-label">
            ชื่อ
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
             {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </label>
         

          <label className="input-label">
            นามสกุล
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
             {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </label>
         
         <div className="age-gender-row">
  <label className="input-label age-input">
  อายุ
  <input
    type="number"
    name="age"
    min="1"
    value={formData.age}
    onChange={handleChange}
  />
  {errors.age && <div className="error-message">{errors.age}</div>}
  
</label>
</div>

          <label className="input-label">
            เพศ
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">เลือก</option>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่นๆ</option>
            </select>
            {errors.gender && <div className="error-message">{errors.gender}</div>}
          </label>
          

          <label className="input-label">
            ที่อยู่
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
            {errors.address && <div className="error-message">{errors.address}</div>}
          </label>
          

          <label className="input-label">
            วันเกิด
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
            {errors.dob && <div className="error-message">{errors.dob}</div>}
          </label>
          

         <label className="input-label">
  เบอร์โทรศัพท์
  <input
    type="tel"
    name="phone"
    maxLength={12} // เผื่อขีด: 090-123-4567 = 12
    value={formData.phone}
    onChange={(e) => {
      let raw = e.target.value.replace(/\D/g, ""); // ลบ non-digit ทั้งหมด
      if (raw.length > 10) raw = raw.slice(0, 10); // จำกัดแค่ 10 ตัวเลข

      // ใส่ขีดอัตโนมัติ
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
  {errors.phone && <div className="error-message">{errors.phone}</div>}
</label>            
          <button type="button" className="yokhealth-btn" onClick={handleNext}>ถัดไป
           
          </button>
           <p className="login-link">
            มีบัญชีผู้ใช้แล้ว? <a href="/">เข้าสู่ระบบ</a>
          </p>
        </>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <>
          <label className="email-label">
            อีเมล
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </label>
          

          <label className="input-label">
            รหัสผ่าน
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </label>
          

          <label className="input-label">
            ยืนยันรหัสผ่าน
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}

          </label>
          
          <div className="form-buttons">
            <button type="button" className="yokhealth-btn" onClick={() => setStep(step - 1)}>ย้อนกลับ</button>
            <button type="button" className="yokhealth-btn" onClick={handleNext}>ถัดไป
          </button>
          </div>
        </>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <>
<div className="privacy-topics">
   <div style={{ textAlign: "right", marginBottom: "1rem" }}>
  <button
    type="button"
    onClick={() => setLanguage(language === "TH" ? "EN" : "TH")}
    className="lang-switch-btn"
  >
    {language === "TH" ? "EN" : "TH"}
  </button>
</div>
   <div className="privacy-flex">
        {/* ฝั่งซ้าย: ข้อความ */}
        <div className="privacy-left">
          <h4>
            {language === "TH"
              ? "นโยบายความเป็นส่วนตัวและการให้ความยินยอม"
              : "Privacy Policy & Consent"}
          </h4>
          <ul>
            {policyItems[language].map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        {/* ฝั่งขวา: รูปภาพ */}
        <div className="eatprivacy">
        <div className="privacy-right">
          <img
            src={privacyImage}
            alt="Privacy Illustration"
            className="privacy-img"
          />
        </div>
        </div>
      </div>
</div>


     
          <label className="consent-checkbox">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
            />
            <span
              onClick={(e) => {
                e.preventDefault();
                Swal.fire({
                  title: "นโยบายความเป็นส่วนตัวและการให้ความยินยอม",
                  html: `
                  <ul style="text-align: left; padding-left: 1.2em;">
            <li>แอปพลิเคชันจะเก็บรวบรวมข้อมูลส่วนบุคคล ข้อมูลบำบัด CBT เพื่อใช้ในการให้บริการ</li>
            <li>ข้อมูลของผู้ใช้จะถูกเก็บรักษาอย่างปลอดภัยและจำกัดการเข้าถึงเฉพาะเจ้าหน้าที่ที่รับผิดชอบ</li>
            <li>ข้อมูลส่วนบุคคลจะไม่ถูกเปิดเผยแก่บุคคลที่สามโดยไม่ได้รับความยินยอมล่วงหน้า เว้นแต่เป็นไปตามกฎหมาย</li>
            <li>ผู้ใช้มีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของตนเองได้ตามกฎหมายที่เกี่ยวข้อง</li>
            <li>การใช้แอปพลิเคชันถือเป็นการยินยอมให้เก็บ ใช้ และประมวลผลข้อมูลส่วนบุคคลตามนโยบายนี้</li>
            <li>
    หากมีข้อสงสัยหรือต้องการติดต่อเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อได้ที่<br><br>
    <img src="https://cdn-icons-png.flaticon.com/128/126/126509.png" width="16" style="vertical-align: middle; margin-right: 6px;" />
    โทรศัพท์: 094-564-3456<br><br>
    <img src="https://cdn-icons-png.flaticon.com/128/732/732200.png" width="16" style="vertical-align: middle; margin-right: 6px;" />
    อีเมล: DepressionRec@gmail.com
  </li>
          </ul>
        `,
        imageUrl: "https://cdn-icons-png.flaticon.com/128/10348/10348976.png",
        imageWidth: 64,
        imageHeight: 64,
        imageAlt: "Privacy Policy Icon",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "health-btn-swal"
        },
        width: '600px',
        backdrop: true,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    }}
    style={{ cursor: "pointer", color: "#007bff", marginLeft: "8px" }}
  >
    ยอมรับนโยบายความเป็นส่วนตัว
  </span>
          </label>
          {errors.consent && <div className="error-message">{errors.consent}</div>}



          <div className="form-buttons">
            <button type="submit" onClick={() => setStep(step - 1)}>ย้อนกลับ</button>
            <button type="submit" onClick={handleNext}>ถัดไป</button>
          </div>
        </>
      )}
{step === 4 && (
  <>
   <label className="input-label">
  PIN 
  <input
    type="text"
    name="verifyCode"
    value={formData.verifyCode}
    onChange={handleChange}
    maxLength={6}
    placeholder="XXXXXX"
  />
  {errors.verifyCode && <div className="error-message">{errors.verifyCode}</div>}
</label>


    <div className="form-buttons">
      <button type="submit" onClick={() => setStep(step - 1)}>ย้อนกลับ</button>
      <button type="submit">ลงทะเบียน</button>
    </div>
  </>
)}

      {/* STEP 4 */}
      {step === 5 && (
        <>
          <div className="northpage"> 
  <h3 className="northmessage">🎉 การลงทะเบียนเสร็จสมบูรณ์</h3>
  <p className="northsubtext">ขอบคุณที่ลงทะเบียนกับเรา</p>
</div>

          <button type="button" className="yokhealth-btn" onClick={() => navigate("/")}>ไปหน้าหลัก</button>
        </>
      )}
    </form>
  </div>
);
};


export default Register;