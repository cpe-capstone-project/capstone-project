import { useState } from "react";
import Swal from "sweetalert2";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { LoginPatient } from "../../services/https/patientService";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ใช้งาน useNavigate
const handleLogin = async () => {
  if (!email && !password) {
    Swal.fire({
      icon: "error",
      title: "กรุณากรอกข้อมูล Password และ Email ให้ครบถ้วน",
    });
    return;
  }

  if (!email) {
    Swal.fire({
      icon: "error",
      title: "กรุณากรอก Email",
    });
    return;
  }

  if (!password) {
    Swal.fire({
      icon: "error",
      title: "กรุณากรอก Password",
    });
    return;
  }

  const isGmail = email.endsWith("@gmail.com");
  const isDepressionEmail = email.endsWith("@depressionrec.go.th");

  if (!isGmail && !isDepressionEmail) {
    Swal.fire({
      icon: "error",
      title: "รูปแบบอีเมลไม่ถูกต้อง",
    });
    return;
  }

  // ✅ เรียก API
  const res = await LoginPatient(email, password);

  if (!res.status) {
    Swal.fire({
      icon: "error",
      title: res.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    });
    return;
  }

  localStorage.setItem("token", res.token ?? ""); // ใช้ ?? เพื่อเช็ค undefined
  localStorage.setItem("user", JSON.stringify({
  email,
  profileName: res.profileName || "",
  userType: res.userType || "",
}));

  // ✅ แสดง SweetAlert แล้ว navigate ต่อ
  Swal.fire({
    title: "เข้าสู่ระบบสำเร็จ!",
    icon: "success",
    confirmButtonText: "OK",
    customClass: {
      popup: "composition-popup",
      title: "composition-title",
      confirmButton: "composition-confirm-btn",
      icon: "composition-icon",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (res.userType === "psychologist" || isDepressionEmail) {
        navigate("/homedoc");
      } else {
        navigate("/homepage");
      }
    }
  });
};


  return (
    <div className="hospitalcare-container">
      <div className="hospitalcare-box">
        <h2 className="hospitalcare-title">ล็อกอิน</h2>

        <label htmlFor="email" className="hospitalcare-label">Email</label>
        <input
          id="email"
          type="email"
          placeholder="กรุณากรอก email ของคุณ"
          className="hospitalcare-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" className="hospitalcare-label">Password</label>
        <input
          id="password"
          type="password"
          placeholder="กรุณากรอก password ของคุณ"
          className="hospitalcare-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="hospitalcare-button" onClick={handleLogin}>
          เข้าสู่ระบบ
        </button>
      </div>
    </div>
  );
}

export default Login;
