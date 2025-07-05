import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignIn } from "../../../services/https/Authentication";
import type { SignInInterface } from "../../../interfaces/SignIn";
import doImage from "../../../assets/doctor.png";
import do1Image from "../../../assets/med2.png";
import do2Image from "../../../assets/med3.png";
import do3Image from "../../../assets/med4.png";
import med5Image from "../../../assets/med5.png";

import "./signin.css";

function SignInPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // เพิ่ม do4Image เข้าไปด้วยเลย
  const doctorImages = [doImage,do1Image, do2Image, do3Image];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % doctorImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const onFinish = async (values: SignInInterface) => {
    const res = await SignIn(values);

    if (res.status === 200) {
      messageApi.success("เข้าสู่ระบบสำเร็จ");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("role", res.data.role);

      const role = res.data.role;
      let redirectPath = "/";
      if (role === "Patient") redirectPath = "/patient";
      else if (role === "Psychologist") redirectPath = "/psychologist";
      else if (role === "Unknown") redirectPath = "/unknown";
      else {
        messageApi.error("ไม่สามารถระบุบทบาทผู้ใช้ได้");
        return;
      }

      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    } else {
      messageApi.error(res.data.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="center" align="center" className="signin-container">
        <Card className="card-login" style={{ width: 900, padding: "2rem" }}>
          <Row align="middle" justify="space-between">
            {/* Left: Logo + form */}
            <Col span={11} style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <img
                  alt="logo"
                  src={med5Image}
                  className="images-logo"
                  style={{ maxWidth: 300, borderRadius: "1rem" }}
                />
              </div>

              <Form
                name="basic"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                style={{ marginTop: "1rem" }}
              >
                <Form.Item
                  label="อีเมล"
                  name="email"
                  rules={[{ required: true, message: "กรุณากรอกอีเมล!" }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="รหัสผ่าน"
                  name="password"
                  rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
                >
                  <Input.Password />
                </Form.Item>
   <Form.Item>
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <Button htmlType="submit" className="login-form-button">
      Login
    </Button>
    <Button
      type="default"
      className="signup-button"
      onClick={() => navigate("/signup")}
    >
      Signup
    </Button>
  </div>
</Form.Item>
              </Form> 
            </Col>

           {/* Right: Rotating images */}
<Col span={12}>
  <div className="doctor-image-wrapper">
    <img
      src={doctorImages[currentImageIndex]}
      alt="doctor"
      className="doctor-image-glass"
      key={currentImageIndex}
    />
  </div>
</Col>

          </Row>
        </Card>
      </Flex>
    </>
  );
}

export default SignInPages;