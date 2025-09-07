import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import { Card, Typography, Spin, Alert, Button, Tag, Divider } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { MdEvStation } from "react-icons/md";
import "./ThoughtRecordDetail.css";

const { Title, Paragraph, Text } = Typography;

const contentItems = [
  { key: "Situation", label: "สถานการณ์", icon: MdEvStation, className: "situation" },
  { key: "Thoughts", label: "ความคิด", icon: FaRegCommentDots, className: "thoughts" },
  { key: "Behaviors", label: "พฤติกรรม", icon: GiDramaMasks, className: "behaviors" },
  { key: "AlternateThought", label: "ความคิดทางเลือก", icon: FaRedoAlt, className: "alternative" },
];

function ThoughtRecordDetail() {
  const { id } = useParams<{ id: string }>();
  const { getRecordById } = useThoughtRecord();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getRecordById(Number(id))
        .then((data) => {
          console.log("ดึง ThoughtRecord มาแล้ว:", data);
          if (data) setRecord(data);
          else setError("ไม่พบข้อมูลบันทึกความคิดนี้");
        })
        .catch(() => setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" tip="กำลังโหลดข้อมูล..." />
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <Alert type="error" message={error} />
      </div>
    );

  const formatDate = (date: string) =>
    date
      ? new Date(date).toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "ไม่ทราบ";

  return (
    <section className="thought-record-detail">
      <div className="container">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="default"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            ย้อนกลับ
          </Button>
        </div>

        <Card className="main-card">
          <div className="title-section">
            <div className="title-left">
              <Title level={2} className="card-title">บันทึกความคิด</Title>
            </div>
            <Tag className="record-tag">รายการที่ {id}</Tag>
          </div>

          <Divider className="custom-divider" />

          {contentItems.map(({ key, label, icon: Icon, className }) => (
            <div key={key} className={`content-item ${className}`}>
              <div className="content-header">
                <Icon className="content-icon" />
                <Text className="content-label">{label}</Text>
              </div>
              <div className="content-body">
                <Paragraph className={`content-text ${key === "AlternateThought" ? "alternative-text" : ""}`}>
                  {record[key] || "ไม่ได้ระบุ"}
                </Paragraph>
              </div>
            </div>
          ))}

          {/* แสดง Emotion */}
          {record.Emotions && record.Emotions.length > 0 ? (
            <div className="content-item emotions">
              <div className="content-header">
                <GiDramaMasks className="content-icon" />
                <Text className="content-label">อารมณ์</Text>
              </div>
              <div
                className="content-body"
                style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
              >
                {record.Emotions.map((emotion: any) => (
                  <Tag
                    key={emotion.ID}
                    className="emotion-tag"
                    style={{
                      background: emotion.EmotionsColor || "#519bf1", // ใช้สีจาก EmotionsColor หรือ fallback
                      color: "#fff",
                    }}
                    title={emotion.ThaiEmotionsname || emotion.Emotionsname}
                  >
                    {emotion.ThaiEmotionsname || emotion.Emotionsname}
                  </Tag>
                ))}

              </div>
            </div>
          ) : (
            <Paragraph className="content-text">ไม่ได้ระบุอารมณ์</Paragraph>
          )}


          <Divider className="timestamp-divider" />

          <div className="timestamp-section">
            <div className="timestamp-item">
              <EditOutlined className="timestamp-icon" />
              <Text type="secondary">
                แก้ไขล่าสุด:{" "}
                <span className="timestamp-value">{formatDate(record.UpdatedAt)}</span>
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default ThoughtRecordDetail;
