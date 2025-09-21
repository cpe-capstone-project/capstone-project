// ThoughtRecordCreate.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import { useTherapyCase } from "../../contexts/TherapyCaseContext";
import { FaBookOpen, FaRegCommentDots, FaRedoAlt, FaLightbulb } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { MdEvStation } from "react-icons/md";
import {
  Card,
  Typography,
  Form,
  Input, 
  Button,
  Divider,
  message,
  Row,
  Col,
  Space,
  Select,
  Tag,
  Checkbox,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  TagsOutlined,
  SmileOutlined,
  BgColorsOutlined,
  RobotOutlined,
} from "@ant-design/icons";

import GuideButton from "../../components/thought-record-guide/GuideModel";
import FormGuide from "../../components/thought-record-guide/FormGuide";
import SituationTagSelect from "../../components/situation-tag/SituationTagSelect";
import ThoughtRecordSubmit from "../../components/thought_record-submit/ThoughtRecordSubmit";
import ColorPickerWithPresets from "../../components/thought_record-submit/ColorPickerWithPresets";
import "./ThoughtRecordCreate.css";
import { 
  GetAllEmotions, 
  CreateEmotionAnalysisFromThoughtRecord 
} from "../../services/https/EmotionAnalysis";
import type { IEmotion } from "../../interfaces/IEmotion";
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
  const [therapyCase, setTherapyCase] = useState<TherapyCaseInterface | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [emotions, setEmotions] = useState<IEmotion[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState<ThoughtRecordFormValues | null>(null);
  const [useAiAnalysis, setUseAiAnalysis] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // preload รายการอารมณ์
  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const res = await GetAllEmotions();
        console.log("Emotion API response:", res);

        if (res?.data && Array.isArray(res.data)) {
          const mapped: IEmotion[] = res.data
            .filter((e: any) => e.emotions_name)
            .map((e: any, idx: number) => ({
              ID: idx + 1,
              Emotionsname: e.emotions_name,
              ThaiEmotionsname: e.thai_emotions_name || e.emotions_name,
              EmotionsColor: e.emotion_color || "#999999",
              Category: e.category || "",
            }));
          setEmotions(mapped);
          console.log("Mapped emotions:", mapped);
        } else {
          setEmotions([]);
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดอารมณ์:", err);
        setEmotions([]);
      }
    };

    fetchEmotions();
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

  const showConfirmModal = (values: ThoughtRecordFormValues) => {
    setPendingValues(values);
    setConfirmModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingValues) return;
    setLoading(true);
    setConfirmModalVisible(false);

    try {
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
      const createdRecord = await createRecord(payload);
      
      if (createdRecord && createdRecord.ID) {
        message.success("สร้างบันทึกความคิดเรียบร้อย ✅");
        
        // ถ้าเลือกให้ AI วิเคราะห์อารมณ์และไม่ได้เลือกอารมณ์
        if (useAiAnalysis && (!pendingValues.EmotionsID || pendingValues.EmotionsID.length === 0)) {
          await handleAiEmotionAnalysis(createdRecord.ID);
        }
        
        navigate("/patient/thought_records");
      } else {
        message.error("ไม่สามารถสร้างบันทึกความคิดได้ ❌");
      }
    } catch (error) {
      console.error("Error creating thought record:", error);
      message.error("เกิดข้อผิดพลาดในการสร้างบันทึกความคิด ❌");
    } finally {
      setLoading(false);
      setPendingValues(null);
    }
  };

  const handleAiEmotionAnalysis = async (thoughtRecordId: number) => {
  console.log("AI analyze for ThoughtRecord ID:", thoughtRecordId); // ✅ ID ที่ส่งไป

  setAiAnalysisLoading(true);
  message.loading("กำลังวิเคราะห์อารมณ์ด้วย AI...", 0);

  try {
    const response = await CreateEmotionAnalysisFromThoughtRecord(thoughtRecordId);

    // ✅ log response ทั้งหมด
    console.log("AI Analysis Response:", response);

    if (response?.status === 201 || response?.status === 200) {
      message.destroy();
      message.success({
        content: `AI วิเคราะห์อารมณ์เรียบร้อย! พบอารมณ์หลัก: ${response.data?.emotion_results?.primary_emotion || 'ไม่ระบุ'}`,
        duration: 5,
      });
      console.log("AI primary emotion:", response.data?.emotion_results?.primary_emotion);
    } else {
      message.destroy();
      if (response?.data?.error?.includes("มีอารมณ์อยู่แล้ว")) {
        message.warning("บันทึกความคิดนี้มีการวิเคราะห์อารมณ์แล้ว");
      } else {
        message.error("AI ไม่สามารถวิเคราะห์อารมณ์ได้ กรุณาลองใหม่อีกครั้ง");
      }
    }
  } catch (error) {
    message.destroy();
    console.error("AI Emotion Analysis Error:", error); // ✅ log error
    message.error("เกิดข้อผิดพลาดในการวิเคราะห์อารมณ์ด้วย AI");
  } finally {
    setAiAnalysisLoading(false);
  }
};


  const onFinish = async (values: ThoughtRecordFormValues) => {
    // ตรวจสอบว่าเลือกให้ AI วิเคราะห์หรือเลือกอารมณ์เอง
    const hasSelectedEmotions = values.EmotionsID && values.EmotionsID.length > 0;
    
    if (!useAiAnalysis && !hasSelectedEmotions) {
      message.warning("กรุณาเลือกอารมณ์หรือเปิดใช้งานการวิเคราะห์อารมณ์ด้วย AI");
      return;
    }

    if (useAiAnalysis && hasSelectedEmotions) {
      message.warning("กรุณาเลือกเพียงวิธีเดียว: เลือกอารมณ์เองหรือใช้ AI วิเคราะห์");
      return;
    }

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
        {emotion?.ThaiEmotionsname || label}
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
            <div className="header-content" style={{ textAlign: "center", marginBottom: 32 }}>
              <Title level={2} className="page-title">
                <BulbOutlined className="title-icon" /> สร้างบันทึกความคิด
              </Title>
              <p className="page-subtitle">
                เขียนบันทึกความคิดของคุณอย่างตรงไปตรงมา โดยใส่ความรู้สึกและความคิดจริงของตัวเอง
              </p>
              <Button
                onClick={() => setShowGuide(true)}
                className="guide-button-capsule"
                icon={<FaBookOpen style={{ color: "white" }} />}
              >
                คำแนะนำการกรอกฟอร์ม
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
                <Title level={4}>🎨 การปรับแต่ง</Title>
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
                      <ColorPickerWithPresets
                        value={form.getFieldValue("TagColors")}
                        onChange={(color: any) => form.setFieldsValue({ TagColors: color })}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* ข้อมูลหลัก */}
              <div className="form-section">
                <Title level={4}>📝 ข้อมูลหลัก</Title>
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
                      <TextArea
                        rows={4}
                        placeholder="อธิบายสถานการณ์อย่างละเอียดที่สุด เช่น เกิดอะไรขึ้นกับคุณ ใครบ้างที่เกี่ยวข้อง สถานที่ เวลา และความรู้สึกตอนนั้น..."
                      />
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
                      <TextArea
                        rows={4}
                        placeholder="บันทึกความคิดหรือคำพูดในใจของคุณตอนนั้น ลองระบุให้ชัดเจนและตรงกับความรู้สึกที่สุด..."
                      />
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
                <Title level={4}>🔍 การตอบสนองและวิเคราะห์</Title>
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
                      <TextArea
                        rows={3}
                        placeholder="สิ่งที่คุณทำหรือวิธีตอบสนองต่อสถานการณ์นั้น ลองเขียนให้ชัดเจนที่สุด..."
                      />
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
                      <TextArea
                        rows={3}
                        placeholder="เขียนความคิดที่เป็นทางเลือกและเป็นบวกมากขึ้นสำหรับสถานการณ์นี้..."
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* ส่วนเลือกอารมณ์ */}
              <div className="form-section">
                <Title level={4}>
                  <SmileOutlined style={{ color: "#f59e0b" }} /> การเลือกอารมณ์
                </Title>
                <Divider />
                
                {/* AI Analysis Checkbox */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24}>
                    <Checkbox
                      checked={useAiAnalysis}
                      onChange={(e) => {
                        setUseAiAnalysis(e.target.checked);
                        if (e.target.checked) {
                          form.setFieldsValue({ EmotionsID: [] });
                        }
                      }}
                    >
                      <Space>
                        <RobotOutlined style={{ color: "#722ed1" }} />
                        <span>ใช้ AI วิเคราะห์อารมณ์อัตโนมัติ</span>
                      </Space>
                    </Checkbox>
                    {useAiAnalysis && (
                      <Alert
                        message="AI จะวิเคราะห์อารมณ์จากเนื้อหาในช่อง 'ความคิดทางเลือก' และ 'พฤติกรรม' ของคุณ"
                        type="info"
                        showIcon
                        style={{ marginTop: 8 }}
                      />
                    )}
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      label="เลือกอารมณ์ด้วยตัวเอง"
                      name="EmotionsID"
                    >
                      <Select
                        mode="multiple"
                        placeholder={useAiAnalysis ? "AI จะเลือกอารมณ์ให้อัตโนมัติ" : "เลือกอารมณ์"}
                        allowClear
                        disabled={useAiAnalysis}
                        getPopupContainer={(trigger) => trigger.parentNode}
                        style={{ width: "100%" }}
                        virtual={false}
                        tagRender={(props) => {
                          const { label, value, closable, onClose } = props;
                          const emotion = emotions.find((e) => e.ID === value);
                          return (
                            <Tag
                              color={emotion?.EmotionsColor || "default"}
                              closable={closable}
                              onClose={onClose}
                              style={{ marginRight: 3 }}
                            >
                              {emotion
                                ? `${emotion.ThaiEmotionsname || ""} (${emotion.Emotionsname || ""})`
                                : label}
                            </Tag>
                          );
                        }}
                      >
                        {emotions.length > 0 ? (
                          emotions.map((emotion) => (
                            <Option key={emotion.ID} value={emotion.ID}>
                              <span
                                style={{
                                  display: "inline-block",
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  backgroundColor: emotion.EmotionsColor,
                                  marginRight: 8,
                                }}
                              />
                              {`${emotion.ThaiEmotionsname} (${emotion.Emotionsname})`}
                            </Option>
                          ))
                        ) : (
                          <Option disabled>ไม่พบอารมณ์</Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Tip Section */}
              <div className="tip-section">
                <div className="tip-header">
                  <FaLightbulb className="tip-icon" />
                  <span>เคล็ดลับการบันทึกที่ดี</span>
                </div>
                <div className="tip-content">
                  เขียนให้ตรงกับความรู้สึกและความคิดจริงของคุณ
                  ใช้ภาษาง่าย ๆ ที่คุณเข้าใจ
                  อย่ากังวลเรื่องถูกผิด เขียนเพื่อเข้าใจตัวเอง
                  อ่านทบทวนทุกสัปดาห์เพื่อเห็นพัฒนาการและแนวทางปรับปรุงตัวเอง
                </div>
              </div>

              <div className="form-actions">
                <Button type="default" onClick={() => navigate(-1)}>
                  ยกเลิก
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading || aiAnalysisLoading}
                  style={{ width: "auto", minWidth: 20 }}
                >
                  {aiAnalysisLoading ? "กำลังวิเคราะห์..." : "บันทึก"}
                </Button>
              </div>
            </Form>
          </Card>
        ) : (
          <FormGuide onBack={() => setShowGuide(false)} />
        )}

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