import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import { Card, Typography, Spin, Alert, Button, Tag, Divider } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  FaRegCommentDots,
  FaRedoAlt,
  FaBrain,
} from "react-icons/fa";
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
        .then((data) => (data ? setRecord(data) : setError("ไม่พบข้อมูลบันทึกความคิดนี้")))
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

        {/* ✅ ปุ่มย้อนกลับแบบ Ant Design */}
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary" // เปลี่ยนจาก default เป็น primary
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

        </div>

        <Card className="main-card">
          <div className="title-section">
            <div className="title-left">
              <FaBrain className="brain-icon" />
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

          <Divider className="timestamp-divider" />

          <div className="timestamp-section">
            <div className="timestamp-item">
              <CalendarOutlined className="timestamp-icon" />
              <Text type="secondary">
                สร้างเมื่อ:{" "}
                <span className="timestamp-value">{formatDate(record.CreatedAt)}</span>
              </Text>
            </div>
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
