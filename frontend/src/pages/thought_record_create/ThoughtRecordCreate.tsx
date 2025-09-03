import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Divider,
  message,
  ColorPicker,
  Row,
  Col,
  Space,
  Select,
} from "antd";
import { ArrowLeftOutlined, BulbOutlined } from "@ant-design/icons";
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { MdEvStation } from "react-icons/md";
import GuideButton from "../../components/thought-record-guide/GuideModel";
import FormGuide from "../../components/thought-record-guide/FormGuide";
import "./ThoughtRecordCreate.css";

import { GetAllEmotions } from "../../services/https/Emotions";
import type { EmotionsInterface } from "../../interfaces/IEmotions";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function ThoughtRecordCreate() {
  const { createRecord } = useThoughtRecord();
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [emotions, setEmotions] = useState<EmotionsInterface[]>([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  // preload รายการอารมณ์ (options)
  useEffect(() => {
    (async () => {
      const res = await GetAllEmotions();
      if (Array.isArray(res)) {
        const filtered = res.filter((emotion: EmotionsInterface) => emotion.ID && emotion.ID > 3);
        setEmotions(filtered);
      }

    })();
  }, []);
  const onFinish = async (values: any) => {
    setLoading(true);

    // ส่ง EmotionsID เป็น number (อันเดียว)
    const payload = {
      ...values,
      EmotionsID: values.EmotionsID ?? null,
    };

    const success = await createRecord(payload);
    if (success) {
      message.success("สร้างบันทึกความคิดเรียบร้อย ✅");
      navigate("/patient/thought_records");
    } else {
      message.error("ไม่สามารถสร้างบันทึกความคิดได้ ❌");
    }
    setLoading(false);
  };

  return (
    <section className="thought-record-create">
      <div className="container">
        {/* ปุ่มกลับ */}
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => (showGuide ? setShowGuide(false) : navigate(-1))}
          style={{ marginBottom: 16 }}
        >
          {showGuide ? "กลับไปหน้าฟอร์ม" : "ย้อนกลับ"}
        </Button>

        {/* เงื่อนไขแสดงหน้า */}
        {!showGuide ? (
          <Card className="form-card">
            {/* Header Inside Card */}
            <div className="header-content" style={{ marginBottom: 16 }}>
              <Title level={2} className="page-title">
                <BulbOutlined className="title-icon" />
                สร้างบันทึกความคิด
              </Title>
            </div>

            {/* ปุ่มไปหน้าคู่มือ */}
            <div style={{ textAlign: "left" }}>
              <Button type="link" onClick={() => setShowGuide(true)}>
                📘 คำแนะนำการกรอกฟอร์ม
              </Button>
            </div>

            {/* ฟอร์ม */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="create-form"
              initialValues={{
                TagColors: "#155fdeff",
                EmotionsID: undefined, // ค่าเริ่มต้นว่าง (เลือกได้อันเดียว)
              }}
            >
              {/* Customization Section */}
              <div className="form-section">
                <div className="section-header">
                  <Title level={4} className="section-title">
                    การปรับแต่ง
                  </Title>
                  <Divider className="section-divider" />
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="สีหัวข้อบันทึก"
                      name="TagColors"
                      rules={[{ required: true, message: "กรุณาเลือกสี" }]}
                    >
                      <ColorPicker
                        showText
                        size="large"
                        format="hex"
                        onChange={(color) => {
                          form.setFieldsValue({
                            TagColors: color.toHexString(),
                          });
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Core Information Section */}
              <div className="form-section">
                <div className="section-header">
                  <Title level={4} className="section-title">ข้อมูลหลัก</Title>
                  <Divider className="section-divider" />
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space className="field-label">
                          <MdEvStation className="field-icon situation" />
                          <span>สถานการณ์</span>
                          <GuideButton type="situation" />
                        </Space>
                      }
                      name="Situation"
                      rules={[{ required: true, message: "กรุณากรอกสถานการณ์" }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="อธิบายสถานการณ์ที่เกิดขึ้น เช่น สถานที่ เวลา และบริบทต่างๆ"
                        className="textarea-field"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space className="field-label">
                          <FaRegCommentDots className="field-icon thoughts" />
                          <span>ความคิด</span>
                          <GuideButton type="thoughts" />
                        </Space>
                      }
                      name="Thoughts"
                      rules={[{ required: true, message: "กรุณากรอกความคิด" }]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="บันทึกความคิดที่เกิดขึ้นในขณะนั้น ทั้งความคิดเชิงบวกและเชิงลบ"
                        className="textarea-field"
                      />
                    </Form.Item>
                  </Col>

                  {/* Emotion Select (อันเดียว) */}
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space className="field-label">
                          <span>อารมณ์</span>
                        </Space>
                      }
                      name="EmotionsID"
                      rules={[{ required: true, message: "กรุณาเลือกอารมณ์" }]}
                    >
                      <Select
                        placeholder="เลือกอารมณ์"
                        allowClear
                        // ลบ getPopupContainer หรือเปลี่ยนเป็น trigger => trigger.parentNode
                        getPopupContainer={(trigger) => trigger.parentNode}
                        style={{ width: '100%' }}
                        dropdownStyle={{ zIndex: 1050 }} // เพิ่ม zIndex
                        virtual={false} // ปิด virtual scrolling
                      >
                        {emotions.map((emotion) => (
                          <Option key={emotion.ID} value={emotion.ID}>
                            <span style={{ color: emotion.EmotionsColor || "#000" }}>
                              {emotion.ThaiEmotionsname || emotion.Emotionsname}
                            </span>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Response & Analysis Section */}
              <div className="form-section">
                <div className="section-header">
                  <Title level={4} className="section-title">การตอบสนองและวิเคราะห์</Title>
                  <Divider className="section-divider" />
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      label={
                        <Space className="field-label">
                          <GiDramaMasks className="field-icon behaviors" />
                          <span>พฤติกรรม</span>
                          <GuideButton type="behaviors" />
                        </Space>
                      }
                      name="Behaviors"
                    >
                      <TextArea
                        rows={3}
                        placeholder="สิ่งที่คุณทำเป็นผลจากความคิดนั้น"
                        className="textarea-field"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Form.Item
                      label={
                        <Space className="field-label">
                          <FaRedoAlt className="field-icon alternate" />
                          <span>ความคิดทางเลือก</span>
                          <GuideButton type="alternate" />
                        </Space>
                      }
                      name="AlternateThought"
                    >
                      <TextArea
                        rows={3}
                        placeholder="ความคิดทางเลือกที่เป็นไปได้"
                        className="textarea-field"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <Button type="default" onClick={() => navigate(-1)}>
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ width: "auto" }}
                >
                  บันทึก
                </Button>
              </div>
            </Form>
          </Card>
        ) : (
          <FormGuide onBack={() => setShowGuide(false)} />
        )}
      </div>
    </section>
  );
}

export default ThoughtRecordCreate;
