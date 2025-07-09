import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";
import { useNavigate } from "react-router";
import type { SignInInterface } from "../../../interfaces/SignIn";
import Swal from "sweetalert2";
import patientImage from "../../../assets/patient.png";
import psychologyImage from "../../../assets/psychology.png";
import { SignIn, SignInPsychologist } from "../../../services/https/Authentication";
import MindcareImage from "../../../assets/mindcare.png";
function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

   const onFinish = async (values: SignInInterface) => {
    const email = values.email?.toLowerCase().trim();
    const cleanedValues = { ...values, email };

    let res;

    if (email && email.endsWith("@depressionrec.go.th")) {
      res = await SignInPsychologist(cleanedValues);
    } else {
      res = await SignIn(cleanedValues);
    }

    if (res.status === 200) {
      messageApi.success("Sign-in successful");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email); 
      const role = res.data.role;
      let redirectPath = "/";

      if (role === "Patient") redirectPath = "/patient/home";
      else if (role === "Psychologist") redirectPath = "/psychologist/homedoc";
      else {
        messageApi.error("Unknown role");
        return;
      }

      setTimeout(() => {
        location.href = redirectPath;
      }, 1000);
    } else {
      messageApi.error(res.data?.error || "Sign-in failed");
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
      const email = (document.getElementById("forgot-email") as HTMLInputElement)?.value;
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
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      // TODO: ส่งข้อมูลไปยัง API เปลี่ยนรหัสผ่าน
      Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว",
        confirmButtonColor: "#3085d6"
      });
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
                      borderRadius: 8,
                      height:40,
                      backgroundColor: "#f5faff",
                      border: "1px solid #dbe9f9",
                      padding: "0 18px"
                    }}
                    placeholder="Enter your email"
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
                      borderRadius: 8,
                      height:40,
                      backgroundColor: "#f5faff",
                      border: "1px solid #dbe9f9",
                      padding: "0 18px"
                    }}
                    placeholder="Enter your password"
                  />
                </Form.Item>

                <div
  style={{ marginBottom: 12, textAlign: "left", color: "#5c82b8", fontSize: 14, cursor: "pointer" }}
  onClick={handleForgotPasswordClick}
>
  Forgot Password?
</div>

               <Form.Item>
  <Button
    type="primary"
    htmlType="submit"
    style={{
      width: "100%",
      borderRadius: 8,
      backgroundColor: "#1890ff",
      color: "#ffffff",
      fontWeight: 600,
      fontSize: 14,
      border: "none",
      boxShadow: "none",         // ไม่มีเงา
      transition: "none",        // ไม่มี animation
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
    color: "#5c82b8",
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
