import React, { useEffect, useState } from "react";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import {
  Select,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Button,
} from "antd";
import { EyeOutlined } from "@ant-design/icons"; // เพิ่มอันนี้

import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router";
import "./ThoughtRecordList.css"; // <-- สำคัญ
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";


const { Title, Text, Paragraph } = Typography;

function ThoughtRecordList() {
  const { records, loading, error, fetchRecords } = useThoughtRecord();

  const [sortField, setSortField] = useState<"UpdatedAt" | "CreatedAt">("UpdatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords(sortField, sortOrder);
  }, [sortField, sortOrder]);

  return (
    <section
      style={{
        padding: "32px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          บันทึกความคิด (Thought Records)
        </Title>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Select
            value={sortField}
            onChange={(value) => setSortField(value)}
            options={[
              { value: "UpdatedAt", label: "วันที่แก้ไข" },
              { value: "CreatedAt", label: "วันที่สร้าง" },
            ]}
            style={{ width: 180 }}
          />
          <Select
            value={sortOrder}
            onChange={(value) => setSortOrder(value)}
            options={[
              { value: "desc", label: "ล่าสุด" },
              { value: "asc", label: "เก่าสุด" },
            ]}
            style={{ width: 140 }}
          />
          <Button
            type="primary"
            icon={<FaPlus />}
            style={{ borderRadius: "var(--radius-full)" }}
            onClick={() => navigate("/thought-records/create")}
          >
            สร้างบันทึก
          </Button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <Spin tip="กำลังโหลด..." />
      ) : error ? (
        <Alert message="เกิดข้อผิดพลาด" description={error} type="error" showIcon />
      ) : records.length === 0 ? (
        <Text>ไม่มีบันทึกความคิดที่จะแสดง</Text>
      ) : (
        <Row gutter={[24, 24]}>
          {records.map((record) => (
            <Col key={record.ID} xs={24} sm={24} md={12} lg={8} xl={6}>
              <div className="card-hover-wrapper">
                <Card
                  title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 6,
                          height: 24,
                          backgroundColor: record.TagColors?.trim() || "#1890ff",
                          borderRadius: 2,
                        }}
                      />
                      <Paragraph
                        style={{
                          margin: 0,
                          maxWidth: "calc(100% - 12px)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: 500,
                          fontSize: "15px",
                          color: "#1f1f1f",
                        }}
                        title={record.Situation || "-"}
                      >
                        {record.Situation || "-"}
                      </Paragraph>

                    </div>
                  }
                  hoverable
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    height: "100%",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <div style={{ flexGrow: 1 }}>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                        <Paragraph ellipsis={{ rows: 1 }}>
                          <FaRegCommentDots style={{ marginRight: 6, color: "#519bf1ff" }} />
                          <Text strong>ความคิด:</Text> {record.Thoughts || "-"}
                        </Paragraph>
                      </div>
                      <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                        <Paragraph ellipsis={{ rows: 1 }}>
                          <GiDramaMasks style={{ marginRight: 6, color: "#519bf1ff" }} />
                          <Text strong>พฤติกรรม:</Text> {record.Behaviors || "-"}
                        </Paragraph>
                      </div>
                      <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                        <Paragraph ellipsis={{ rows: 1 }}>
                          <FaRedoAlt style={{ marginRight: 6, color: "#519bf1ff" }} />
                          <Text strong>ความคิดทางเลือก:</Text> {record.AlternateThought || "-"}
                        </Paragraph>
                      </div>
                    </Space>
                  </div>

                  <Divider style={{ margin: "8px 0" }} />

                  <Text type="secondary" style={{ fontSize: "12px", marginTop: "auto" }}>
                    แก้ไขล่าสุด:{" "}
                    {record.UpdatedAt
                      ? new Date(record.UpdatedAt).toLocaleString("th-TH")
                      : "-"}
                  </Text>

                  <Button
                    className="view-more-button"
                    type="primary"
                    shape="circle"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/patient/thought_record/${record.ID}`)}
                  />
                </Card>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </section>
  );
}
export default ThoughtRecordList;
