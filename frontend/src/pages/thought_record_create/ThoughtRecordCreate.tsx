import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import { useTherapyCase } from "../../contexts/TherapyCaseContext";
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
  Tag,
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
import type { TherapyCaseInterface } from "../../interfaces/ITherapyCase";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

function ThoughtRecordCreate() {
  const { createRecord } = useThoughtRecord();
  const { getTherapyCaseByPatient } = useTherapyCase();
  const [therapyCase, setTherapyCase] = useState<TherapyCaseInterface | null>(null);
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

  // โหลด TherapyCase ของ patient
  useEffect(() => {
    const fetchTherapyCase = async () => {
      try {
        const patientId = Number(localStorage.getItem("patient_id"));
        if (patientId) {
          const tc = await getTherapyCaseByPatient(patientId);
          if (tc) setTherapyCase(tc);
          else message.error("ไม่พบ TherapyCase ของผู้ใช้ ❌");
        } else message.error("ไม่พบ patient_id ในระบบ ❌");
      } catch (err) {
        console.error(err);
        message.error("เกิดข้อผิดพลาดในการโหลด TherapyCase ❌");
      }
    };
    fetchTherapyCase();
  }, [getTherapyCaseByPatient]);

  const onFinish = async (values: any) => {
    setLoading(true);

    // แก้ให้ส่ง EmotionsID เป็น array
    const payload = {
      ...values,
      EmotionsID: Array.isArray(values.EmotionsID)
        ? values.EmotionsID
        : values.EmotionsID
          ? [values.EmotionsID]
          : [],
      TherapyCaseID: therapyCase?.ID ?? null,
    };

    // ✅ Debug payload ก่อนส่ง
    console.log("Payload to API:", payload);

    const success = await createRecord(payload);
    if (success) {
      message.success("สร้างบันทึกความคิดเรียบร้อย ✅");
      navigate("/patient/thought_records");
    } else {
      message.error("ไม่สามารถสร้างบันทึกความคิดได้ ❌");
    }
    setLoading(false);
  };


  // แสดงสี tag ของ Multi-Select
  const tagRender = (props: any) => {
    const { label, value, closable, onClose } = props;
    const emotion = emotions.find((e) => e.ID === value);
    return (
      <Tag
        color={emotion?.EmotionsColor || "default"}
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <section className="thought-record-create">
      <div className="container">
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => (showGuide ? setShowGuide(false) : navigate(-1))}
          style={{ marginBottom: 16 }}
        >
          {showGuide ? "กลับไปหน้าฟอร์ม" : "ย้อนกลับ"}
        </Button>

        {!showGuide ? (
          <Card className="form-card">
            <div className="header-content" style={{ marginBottom: 16 }}>
              <Title level={2} className="page-title">
                <BulbOutlined className="title-icon" />
                สร้างบันทึกความคิด
              </Title>
            </div>

            <div style={{ textAlign: "left" }}>
              <Button type="link" onClick={() => setShowGuide(true)}>
                📘 คำแนะนำการกรอกฟอร์ม
              </Button>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="create-form"
              initialValues={{
                TagColors: "#155fdeff",
                EmotionsID: [],
              }}
            >
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

              <div className="form-section">
                <div className="section-header">
                  <Title level={4} className="section-title">
                    ข้อมูลหลัก
                  </Title>
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
                      <TextArea rows={4} placeholder="อธิบายสถานการณ์..." className="textarea-field" />
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
                      <TextArea rows={4} placeholder="บันทึกความคิด..." className="textarea-field" />
                    </Form.Item>
                  </Col>

                  {/* Multi Emotion */}
                  <Col xs={24}>
                    <Form.Item
                      label={<Space className="field-label"><span>อารมณ์</span></Space>}
                      name="EmotionsID"
                      rules={[{ required: true, message: "กรุณาเลือกอารมณ์" }]}
                    >
                      <Select
                        mode="multiple"
                        placeholder="เลือกอารมณ์"
                        allowClear
                        getPopupContainer={(trigger) => trigger.parentNode}
                        style={{ width: "100%" }}
                        dropdownStyle={{ zIndex: 1050 }}
                        virtual={false}
                        tagRender={tagRender} // ✅ แสดงสีใน tag
                      >
                        {emotions.map((emotion) => (
                          <Option key={emotion.ID} value={emotion.ID}>
                            {emotion.ThaiEmotionsname || emotion.Emotionsname}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <Title level={4} className="section-title">
                    การตอบสนองและวิเคราะห์
                  </Title>
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
                      <TextArea rows={3} placeholder="สิ่งที่คุณทำ..." className="textarea-field" />
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
                      <TextArea rows={3} placeholder="ความคิดทางเลือก..." className="textarea-field" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="form-actions">
                <Button type="default" onClick={() => navigate(-1)}>ยกเลิก</Button>
                <Button type="primary" htmlType="submit" loading={loading} style={{ width: "auto" }}>
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
