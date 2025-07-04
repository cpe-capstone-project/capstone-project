import { Button, Card, Form, Input, message, Flex, Row, Col } from "antd";

import { useNavigate } from "react-router";

import { SignIn } from "../../../services/https/Authentication";
import type { SignInInterface } from "../../../interfaces/SignIn";

import logo from "../../../assets/logo.png";

function SignInPages() {
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: SignInInterface) => {
    const res = await SignIn(values);

    if (res.status == 200) {
      messageApi.success("Sign-in successful");

      localStorage.setItem("isLogin", "true");
      // localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);
      localStorage.setItem("role", res.data.role);

      // ✅ Redirect ตาม role
      const role = res.data.role;
      let redirectPath = "/";

      if (role === "Patient") {
        redirectPath = "/patient";
      } else if (role === "Psychologist") {
        redirectPath = "/psychologist";
      } else if (role === "Unknown") {
        redirectPath = "/unknown";
      } else {
        messageApi.error("Unknown role");
        return;
      }

      setTimeout(() => {
        location.href = redirectPath;
      }, 1000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <>
      {contextHolder}

      <Flex justify="center" align="center" className="login">
        <Card className="card-login" style={{ width: 500 }}>
          <Row align={"middle"} justify={"center"} style={{ height: "400px" }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <img
                alt="logo"
                style={{ width: "80%" }}
                src={logo}
                className="images-logo"
              />
            </Col>

            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form
                name="basic"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Please input your username!" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                    style={{ marginBottom: 20 }}
                  >
                    Log in
                  </Button>
                  Or <a onClick={() => navigate("/signup")}>signup now !</a>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </Flex>
    </>
  );
}

export default SignInPages;
