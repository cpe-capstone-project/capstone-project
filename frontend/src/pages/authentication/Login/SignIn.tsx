import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";
import { useNavigate } from "react-router";
import type { SignInInterface } from "../../../interfaces/SignIn";
import { SignIn, SignInPsychologist, SignInAdmin } from "../../../services/https/Authentication";
import Swal from "sweetalert2";
import patientImage from "../../../assets/patient.png";
import psychologyImage from "../../../assets/psychology.png";
import MindcareImage from "../../../assets/mindcare.png";
import { k, KEYS } from "../../../unid/storageKeys";

function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
   const onFinish = async (values: SignInInterface) => {
  const email = (values.email ?? "").toLowerCase().trim(); 
  const cleanedValues = { ...values, email };

  let res;
  if (email === "spec@gmail.com" || email === "aqua@gmail.com") {
    res = await SignInAdmin(cleanedValues);
  } else if (email.endsWith("@depressionrec.go.th")) {
    res = await SignInPsychologist(cleanedValues);
  } else {
    res = await SignIn(cleanedValues);
  }
if (res.status === 200) {
  messageApi.success("Sign-in successful");

  localStorage.setItem("isLogin", "true");
  localStorage.setItem("token_type", res.data.token_type);
  localStorage.setItem("token", res.data.token);
  localStorage.setItem("id", res.data.id.toString());
  localStorage.setItem("role", res.data.role);
  localStorage.setItem("email", res.data.email);
  const emailNow = res.data.email;
localStorage.setItem("currentLoginUser", emailNow);
const todayKey = new Date().toLocaleDateString("th-TH");
const histKey = `loginHistory-${emailNow}`;
const hist = JSON.parse(localStorage.getItem(histKey) || "{}");
hist[todayKey] = (hist[todayKey] || 0) + 1;
localStorage.setItem(histKey, JSON.stringify(hist));

  const profile = res.data.profile;
  if (profile) {
    localStorage.setItem("first_name", profile.first_name ?? "");
    localStorage.setItem("last_name", profile.last_name ?? "");

    if ("gender" in profile) {
      localStorage.setItem("gender", profile.gender.toString());
    }
    if ("address" in profile) {
      localStorage.setItem("address", profile.address);
    }
    if ("birthday" in profile) {
      localStorage.setItem("birthday", profile.birthday);
    }
    if ("phone" in profile) {
      localStorage.setItem("phone", profile.phone);
    }
  }

  const role = res.data.role;
  let redirectPath = "/";
  if (role === "Patient") redirectPath = "/patient/home";
  else if (role === "Psychologist") redirectPath = "/psychologist/homedoc";
  else if (role === "Admin") redirectPath = "/admin/dashboard";
  else {
    messageApi.error("Unknown role");
    return;
  }
// ✅ หลัง login สำเร็จ
const email = res.data.email;
const today = new Date().toLocaleDateString("th-TH");
const loginHistoryKey = `loginHistory-${email}`;
const loginHistoryRaw = localStorage.getItem(loginHistoryKey) || "{}";
const loginHistory = JSON.parse(loginHistoryRaw);

// เพิ่ม count วันนี้
loginHistory[today] = (loginHistory[today] || 0) + 1;

// ถ้ายังไม่มีข้อมูลเมื่อวาน → ตั้งค่าเริ่มต้นให้เป็น 1 หรือ 0 เพื่อให้คำนวณ % ได้
const yesterday = new Date();
yesterday.setDate(new Date().getDate() - 1);
const yesterdayStr = yesterday.toLocaleDateString("th-TH");
if (loginHistory[yesterdayStr] === undefined) {
  loginHistory[yesterdayStr] = 1; // หรือ 0 ถ้าอยากให้เริ่มนับเปล่า
}

// เก็บกลับ
localStorage.setItem(loginHistoryKey, JSON.stringify(loginHistory));
localStorage.setItem("currentLoginUser", email);
// หลังจากกำหนด role แล้ว (ก่อน redirect ก็ได้)
const uid = res.data.id?.toString();

// ตั้ง ws_uid ให้ component อื่น ๆ ใช้เปิด WS ได้ถูกห้อง
if (role === "Psychologist") {
  localStorage.setItem("psych_id", uid || "");
  localStorage.setItem("ws_uid", `d:${uid}`);  // doctor channel
} else if (role === "Patient") {
  localStorage.setItem("patient_id", uid || "");
  localStorage.setItem("ws_uid", `p:${uid}`);  // patient channel
} else {
  // เผื่อ Admin ยังอยากได้ WS ไว้ในอนาคต
  localStorage.setItem("ws_uid", `a:${uid}`);
}



  // ✅ เรียก fetchProfile แค่ถ้าไม่ใช่ Admin
  if (role !== "Admin") {
    await fetchProfileAndUpdateStorage();
  }

  console.log("redirecting to:", redirectPath);
    try {
    if (role === "Patient" && res?.data?.id) {
      const tz = "Asia/Bangkok";
      const todayISO = new Date().toISOString().slice(0, 10);
      const r = await fetch(
        `http://localhost:8000/api/patients/${res.data.id}/checklists?date=${todayISO}&tz=${encodeURIComponent(tz)}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
          },
        }
      );

      if (r.ok) {
        const data = await r.json();
        localStorage.setItem(
          k(KEYS.CHECK_DAY),
          JSON.stringify({
            date: data.date,
            tasks: (data.tasks || []).map((t: any) => ({ id: t.id, label: t.label })),
            done: data.done || {},
          })
        );
      }
    }
  } catch (e) {
    console.error("preload checklist failed", e);
  }

  // 🔽 redirect คงไว้เหมือนเดิม
  setTimeout(() => {
    location.href = redirectPath;
  }, 1000);

}
 else {
    messageApi.error(res.data?.error || "Sign-in failed");
  }
};
const fetchProfileAndUpdateStorage = async () => {
  try {
    const role = localStorage.getItem("role");
    if (role === "Admin") return; // ✅ ไม่ต้อง fetch โปรไฟล์แอดมิน

    const endpoint =
      role === "Patient"
        ? "http://localhost:8000/patient/profile"
        : "http://localhost:8000/psychologist/profile";

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `${localStorage.getItem("token_type")} ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("first_name", data.first_name ?? "");
      localStorage.setItem("last_name", data.last_name ?? "");
      localStorage.setItem("gender", data.gender?.toString() ?? "");
      localStorage.setItem("address", data.address ?? "");
      localStorage.setItem("birthday", data.birthday ?? "");
      localStorage.setItem("phone", data.phone ?? "");
      localStorage.setItem("email", data.email ?? "");
      localStorage.setItem("profile_image", data.image ?? "");
    }
  } catch (err) {
    console.error("โหลดข้อมูลโปรไฟล์ล้มเหลว", err);
  }
};


  // เพิ่มใน component ด้านบน
const handleRegisterClick = () => {
  Swal.fire({
    title: "Choose Your Role?",
    html: `
      <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
        <div id="patient-role" style="text-align: center; cursor: pointer;">
          <img 
            src="${patientImage}" 
            alt="Patient" 
            style="width: 200px; height: 200px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" 
          />
          <p style="margin-top: 10px; font-weight: bold;">Patient</p>
        </div>
        <div id="psychology-role" style="text-align: center; cursor: pointer;">
          <img 
            src="${psychologyImage}" 
            alt="Psychology" 
            style="width: 200px; height: 200px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" 
          />
          <p style="margin-top: 10px; font-weight: bold;">Psychology</p>
        </div>
      </div>
    `,
    showCancelButton: true,
    showConfirmButton: false,
    customClass: {
      popup: "swal2-border-radius",
    },
    showClass: {
      popup: "",
    },
    hideClass: {
      popup: "",
    },
    didOpen: () => {
      const patientDiv = Swal.getPopup()?.querySelector("#patient-role");
      const psychologyDiv = Swal.getPopup()?.querySelector("#psychology-role");

      patientDiv?.addEventListener("click", () => {
        Swal.close();
        navigate("/register");
      });

      psychologyDiv?.addEventListener("click", () => {
        Swal.close();
        navigate("/rolehealth");
      });
    },
  });
};
const handleForgotPasswordClick = () => {
  Swal.fire({
    title: "เปลี่ยนรหัสผ่าน",
    html: `
      <input id="forgot-email" class="swal2-input" placeholder="Email" type="email" />
      <input id="new-password" class="swal2-input" placeholder="New Password" type="password" />
      <input id="confirm-password" class="swal2-input" placeholder="Confirm Password" type="password" />
    `,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    showCancelButton: true,
    preConfirm: () => {
      const email = (document.getElementById("forgot-email") as HTMLInputElement)?.value.trim().toLowerCase();
      const newPassword = (document.getElementById("new-password") as HTMLInputElement)?.value;
      const confirmPassword = (document.getElementById("confirm-password") as HTMLInputElement)?.value;

      if (!email || !newPassword || !confirmPassword) {
        Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบทุกช่อง");
        return false;
      }

      if (newPassword !== confirmPassword) {
        Swal.showValidationMessage("รหัสผ่านไม่ตรงกัน");
        return false;
      }

      return { email, newPassword };
    },
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      const { email, newPassword } = result.value;

      const isPsychologist = email.endsWith("@depressionrec.go.th");
      const apiUrl = isPsychologist
        ? "http://localhost:8000/psychologist/reset-password"
        : "http://localhost:8000/patient/reset-password";

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "เปลี่ยนรหัสผ่านสำเร็จ",
            text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว",
            confirmButtonColor: "#3085d6"
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
            confirmButtonColor: "#d33"
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาดเครือข่าย",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          confirmButtonColor: "#d33"
        });
      }
    }
  });
};


  return (
    <>
     {contextHolder}
<Flex justify="center" align="center" style={{ minHeight: "100vh", background: "#f9f9f9" }}>
  <Card
    style={{
      width: 500,
      borderRadius: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
      border: "1px solid #fff",
      padding: "2rem"
    }}
  >
    <Row justify="center">
      <Col span={24} style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-block",
            border: "2px solid #000",
            borderRadius: "50%",
            padding: "16px",
          }}
        >
          <img
            src={MindcareImage}
            alt="MindCare Logo"
            style={{
              width: "180px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "10%",
            }}
          />
        </div>
      </Col>
      <Col span={24}>
              <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
<Form.Item
  label={<span style={{ fontWeight: 600 }}>Email</span>}
  name="email"
  rules={[{ required: true, message: "Please enter your email" }]}
>
  <Input
    size="large"
    style={{
      borderRadius: 10,
      height: 40,
      backgroundColor: "#ffffff",
      border: "1.5px solid #d0d0d0", // ✅ ขอบเทาอ่อนเริ่มต้น
      padding: "0 18px",
      fontSize: "1rem",
      fontFamily: "Segoe UI, Sarabun, sans-serif",
      transition: "all 0.3s ease",
    }}
    placeholder="Enter your email"
    onFocus={(e) => {
      e.target.style.border = "1.5px solid  #aadffb "; // ✅ ขอบฟ้าเมื่อคลิก
      e.target.style.boxShadow = "0 0 6px rgba(0, 153, 255, 0.15)";
    }}
    onBlur={(e) => {
      e.target.style.border = "1.5px solid #d0d0d0"; // ✅ กลับเป็นขอบเทาอ่อน
      e.target.style.boxShadow = "none";
    }}
  />
</Form.Item>

<Form.Item
  label={<span style={{ fontWeight: 600 }}>Password</span>}
  name="password"
  rules={[{ required: true, message: "Please enter your password" }]}
>
  <Input.Password
    size="large"
    style={{
      borderRadius: 10,
      height: 40,
      backgroundColor: "#ffffff",
      border: "1.5px solid #d0d0d0",
      padding: "0 18px",
      fontSize: "1rem",
      fontFamily: "Segoe UI, Sarabun, sans-serif",
      transition: "all 0.3s ease",
    }}
    placeholder="Enter your password"
    onFocus={(e) => {
      const input = e.currentTarget.querySelector("input");
      if (input) {
        input.style.border = "1.5px solid #aadffb ";
        input.style.boxShadow = "0 0 6px rgba(0, 153, 255, 0.15)";
      }
    }}
    onBlur={(e) => {
      const input = e.currentTarget.querySelector("input");
      if (input) {
        input.style.border = "1.5px solid #d0d0d0";
        input.style.boxShadow = "none";
      }
    }}
  />
</Form.Item>




                <div
  style={{
    marginBottom: 12,
    textAlign: "left",
    color: "rgb(0, 123, 255)",  // ✅ สีฟ้าน้ำเงินเรียบหรู
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  }}
  onClick={handleForgotPasswordClick}
>
  Forgot Password?
</div>


               <Form.Item>
<Button
  htmlType="submit"
  style={{
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#47a6ffff", 
    color: "#ffffffff",
    fontWeight: 600,
    fontSize: 14,
    border: "1.5px solid #dcdcdc",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)", // เงาเบา ๆ
    transition: "all 0.3s ease",
  }}
 
>
  Login
</Button>
</Form.Item>

              </Form>

              <div style={{ textAlign: "center", fontSize: 14, marginTop: 8 }}>
                Don’t have an account?{" "}
                <a
  onClick={handleRegisterClick}
  style={{
    color: "rgb(0, 123, 255)",  // ✅ สีฟ้าน้ำเงินเรียบหรู
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer"
  }}
>
  Sign Up
</a>

              </div>
            </Col>
          </Row>
        </Card>
      </Flex>
    </>
  );
}

export default SignInPages;