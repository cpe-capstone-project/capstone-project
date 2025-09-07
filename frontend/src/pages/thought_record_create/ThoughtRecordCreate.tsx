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
import {
  ArrowLeftOutlined,
  BulbOutlined,
  TagsOutlined,
  SmileOutlined,
  BgColorsOutlined,
} from "@ant-design/icons";
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { MdEvStation } from "react-icons/md";
import GuideButton from "../../components/thought-record-guide/GuideModel";
import FormGuide from "../../components/thought-record-guide/FormGuide";
import SituationTagSelect from "../../components/situation-tag/SituationTagSelect";
import ThoughtRecordSubmit from "../../components/thought_record-submit/ThoughtRecordSubmit";
import "./ThoughtRecordCreate.css";
import { GetAllEmotions } from "../../services/https/Emotions";
import type { EmotionsInterface } from "../../interfaces/IEmotions";
import type { TherapyCaseInterface } from "../../interfaces/ITherapyCase";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ThoughtRecordFormValues {
  TagColors: string;
  Situation: string;
  Thoughts: string;
  EmotionsID: number[];
  SituationTagID: number;
  Behaviors: string;
  AlternateThought: string;
}

function ThoughtRecordCreate() {
  const { createRecord } = useThoughtRecord();
  const { getTherapyCaseByPatient } = useTherapyCase();

  const [therapyCase, setTherapyCase] = useState<TherapyCaseInterface | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [emotions, setEmotions] = useState<EmotionsInterface[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<ThoughtRecordFormValues | null>(null);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  // preload รายการอารมณ์
  useEffect(() => {
    (async () => {
      const res = await GetAllEmotions();
      if (Array.isArray(res)) {
        const filtered = res.filter(
          (emotion: EmotionsInterface) => emotion.ID && emotion.ID > 3
        );
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

  // แสดง Modal ยืนยัน
  const showConfirmModal = (values: ThoughtRecordFormValues) => {
    setPendingValues(values);
    setConfirmModalVisible(true);
  };

  // บันทึกจริง
  const handleConfirmSave = async () => {
    if (!pendingValues) return;

    setLoading(true);
    setConfirmModalVisible(false);

    const payload = {
      ...pendingValues,
      EmotionsID: Array.isArray(pendingValues.EmotionsID)
        ? pendingValues.EmotionsID
        : pendingValues.EmotionsID
        ? [pendingValues.EmotionsID]
        : [],
      TherapyCaseID: therapyCase?.ID ?? null,
    };

    console.log("Payload to API:", payload);
    const success = await createRecord(payload);
    if (success) {
      message.success("สร้างบันทึกความคิดเรียบร้อย ✅");
      navigate("/patient/thought_records");
    } else {
      message.error("ไม่สามารถสร้างบันทึกความคิดได้ ❌");
    }
    setLoading(false);
    setPendingValues(null);
  };

  const onFinish = async (values: ThoughtRecordFormValues) => {
    showConfirmModal(values);
  };

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
                <BulbOutlined className="title-icon" /> สร้างบันทึกความคิด
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
              initialValues={{ TagColors: "#155fdeff", EmotionsID: [] }}
            >
              {/* การปรับแต่ง */}
              <div className="form-section">
                <Title level={4}>การปรับแต่ง</Title>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Space>
                          <BgColorsOutlined style={{ color: "#1677ff" }} />
                          <span>สีหัวข้อบันทึก</span>
                        </Space>
                      }
                      name="TagColors"
                      rules={[{ required: true, message: "กรุณาเลือกสี" }]}
                    >
                      <ColorPicker
                        showText
                        size="large"
                        format="hex"
                        onChange={(color) =>
                          form.setFieldsValue({ TagColors: color.toHexString() })
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* ข้อมูลหลัก */}
              <div className="form-section">
                <Title level={4}>ข้อมูลหลัก</Title>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space>
                          <MdEvStation className="field-icon situation" />
                          <span>สถานการณ์</span>
                          <GuideButton type="situation" />
                        </Space>
                      }
                      name="Situation"
                      rules={[{ required: true, message: "กรุณากรอกสถานการณ์" }]}
                    >
                      <TextArea rows={4} placeholder="อธิบายสถานการณ์..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space>
                          <FaRegCommentDots className="field-icon thoughts" />
                          <span>ความคิด</span>
                          <GuideButton type="thoughts" />
                        </Space>
                      }
                      name="Thoughts"
                      rules={[{ required: true, message: "กรุณากรอกความคิด" }]}
                    >
                      <TextArea rows={4} placeholder="บันทึกความคิด..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space>
                          <SmileOutlined style={{ color: "#f59e0b" }} />
                          <span>อารมณ์</span>
                        </Space>
                      }
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
                        tagRender={tagRender}
                      >
                        {emotions.map((emotion) => (
                          <Option key={emotion.ID} value={emotion.ID}>
                            {emotion.ThaiEmotionsname || emotion.Emotionsname}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={
                        <Space>
                          <TagsOutlined style={{ color: "#3b82f6" }} />
                          <span>Tag</span>
                        </Space>
                      }
                      name="SituationTagID"
                      rules={[{ required: true, message: "กรุณาเลือก Tag" }]}
                    >
                      <SituationTagSelect
                        value={form.getFieldValue("SituationTagID")}
                        onChange={(id) => form.setFieldsValue({ SituationTagID: id })}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* การตอบสนองและวิเคราะห์ */}
              <div className="form-section">
                <Title level={4}>การตอบสนองและวิเคราะห์</Title>
                <Divider />
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Form.Item
                      label={
                        <Space>
                          <GiDramaMasks className="field-icon behaviors" />
                          <span>พฤติกรรม</span>
                          <GuideButton type="behaviors" />
                        </Space>
                      }
                      name="Behaviors"
                      rules={[{ required: true, message: "กรุณากรอกพฤติกรรม" }]}
                    >
                      <TextArea rows={3} placeholder="สิ่งที่คุณทำ..." />
                    </Form.Item>
                  </Col>

                  <Col xs={24} lg={12}>
                    <Form.Item
                      label={
                        <Space>
                          <FaRedoAlt className="field-icon alternate" />
                          <span>ความคิดทางเลือก</span>
                          <GuideButton type="alternate" />
                        </Space>
                      }
                      name="AlternateThought"
                      rules={[{ required: true, message: "กรุณากรอกความคิดทางเลือก" }]}
                    >
                      <TextArea rows={3} placeholder="ความคิดทางเลือก..." />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="form-actions">
                <Button type="default" onClick={() => navigate(-1)}>
                  ยกเลิก
                </Button>
                <Button type="primary" htmlType="submit" loading={loading} style={{ width: "auto", minWidth: 120 }}>
                  บันทึก
                </Button>
              </div>
            </Form>
          </Card>
        ) : (
          <FormGuide onBack={() => setShowGuide(false)} />
        )}

        {/* ใช้ component แยกสำหรับ Modal ยืนยัน */}
        <ThoughtRecordSubmit
          visible={confirmModalVisible}
          loading={loading}
          pendingValues={pendingValues}
          emotions={emotions}
          onConfirm={handleConfirmSave}
          onCancel={() => {
            setConfirmModalVisible(false);
            setPendingValues(null);
          }}
        />
      </div>
    </section>
  );
}

export default ThoughtRecordCreate;
