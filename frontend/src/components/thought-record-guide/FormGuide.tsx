import React, { useState } from "react";
import { Card, Typography, Button, Space, Divider, Steps, Tooltip, Badge } from "antd";
import { ArrowLeftOutlined, InfoCircleOutlined, CheckOutlined, SmileOutlined } from "@ant-design/icons";
import { MdEvStation } from "react-icons/md";
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";

const { Title, Text } = Typography;

interface FormGuideProps {
  onBack: () => void;
}

const guidePages = [
  {
    title: "ขั้นตอนที่ 1",
    field: "สถานการณ์ (Situation)",
    icon: <MdEvStation style={{ color: "#059669", marginRight: 12, fontSize: 24 }} />,
    bgColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
    borderColor: "#0891b2",
    content: [
      "บันทึกเหตุการณ์ที่เกิดขึ้นอย่างละเอียด",
      "ระบุสถานที่ เวลา และบุคคลที่เกี่ยวข้อง",
      "เขียนให้ชัดเจนพอที่กลับมาอ่านแล้วเข้าใจได้ทันที",
    ],
    example: "เช่น: 'เมื่อวันจันทร์ที่ผ่านมา ตอนเช้า ผมนัดเพื่อนไปดูหนัง แต่เพื่อนไม่มา และไม่รับโทรศัพท์'",
  },
  {
    title: "ขั้นตอนที่ 2",
    field: "ความคิด (Thoughts)",
    icon: <FaRegCommentDots style={{ color: "#dc2626", marginRight: 12, fontSize: 24 }} />,
    bgColor: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
    borderColor: "#dc2626",
    content: [
      "บันทึกความคิดที่ผุดขึ้นในตอนนั้น",
      "เขียนทั้งความคิดด้านบวกและด้านลบ",
      "ไม่ต้องตัดสินว่าดีหรือไม่ดี แค่บันทึกตามจริง",
    ],
    example: "เช่น: 'เพื่อนคงไม่ให้ความสำคัญกับผม' หรือ 'บางทีเพื่อนอาจมีเหตุฉุกเฉิน'",
  },
  {
    title: "ขั้นตอนที่ 3",
    field: "อารมณ์ (Emotions)",
    icon: <SmileOutlined style={{ color: "#2563eb", marginRight: 12, fontSize: 24 }} />,
    bgColor: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    borderColor: "#2563eb",
    content: [
      "ระบุอารมณ์ที่เกิดขึ้น ณ ตอนนั้น เช่น โกรธ เศร้า ดีใจ กังวล",
      "สามารถเลือกได้มากกว่า 1 อารมณ์",
      "เลือกอารมณ์ที่ตรงกับความรู้สึกมากที่สุด",
    ],
    example: "เช่น: 'โกรธ' , 'เศร้า' , 'กังวล'",
  },
  {
    title: "ขั้นตอนที่ 4",
    field: "พฤติกรรม (Behaviors)",
    icon: <GiDramaMasks style={{ color: "#7c3aed", marginRight: 12, fontSize: 24 }} />,
    bgColor: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)",
    borderColor: "#7c3aed",
    content: [
      "ระบุสิ่งที่คุณทำหลังจากเกิดความคิดนั้น",
      "อาจเป็นการพูด การแสดงออก หรือการกระทำ",
      "เขียนเพื่อเห็นผลของความคิดที่มีต่อพฤติกรรม",
    ],
    example: "เช่น: 'ผมโกรธและส่งข้อความถามเพื่อนด้วยน้ำเสียงไม่ดี' หรือ 'ผมนั่งรอและกังวล'",
  },
  {
    title: "ขั้นตอนที่ 5",
    field: "ความคิดทางเลือก (Alternate Thought)",
    icon: <FaRedoAlt style={{ color: "#ea580c", marginRight: 12, fontSize: 24 }} />,
    bgColor: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    borderColor: "#ea580c",
    content: [
      "ลองหาความคิดอื่นที่สมดุลและเป็นจริงมากกว่า",
      "เขียนสิ่งที่เป็นไปได้จริงและช่วยให้รู้สึกดีขึ้น",
      "มองหาหลักฐานที่สนับสนุนความคิดใหม่",
    ],
    example: "เช่น: 'เพื่อนอาจมีเหตุฉุกเฉิน และไม่ได้ตั้งใจทิ้งผม ผมควรถามด้วยความเข้าใจ'",
  },
];

function FormGuide({ onBack }: FormGuideProps) {
  const [page, setPage] = useState(0);
  const current = guidePages[page];
  const total = guidePages.length;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card
        style={{
          borderRadius: 24,
          padding: 0,
          backgroundColor: "#ffffff",
          boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
          border: "1px solid #f0f2f5",
          overflow: "hidden",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            background: current.bgColor,
            padding: "32px 32px 24px 32px",
            borderBottom: `3px solid ${current.borderColor}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <Badge count={page + 1} style={{ backgroundColor: current.borderColor }}>
              <div style={{ width: 48, height: 48 }} />
            </Badge>
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
              {page + 1} / {total}
            </Text>
          </div>

          <Title level={3} style={{ margin: 0, color: "#1f2937", display: "flex", alignItems: "center" }}>
            {current.icon}
            {current.field}
          </Title>
        </div>

        {/* Steps */}
        <div style={{ padding: "24px 32px 16px 32px", backgroundColor: "#fafbfc" }}>
          <Steps
            current={page}
            size="small"
            items={guidePages.map((p, index) => ({
              title: `ขั้นตอน ${index + 1}`,
              status: index < page ? "finish" : index === page ? "process" : "wait",
            }))}
            style={{ marginBottom: 0 }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "24px 32px 32px 32px" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* How to Write */}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0, color: "#374151" }}>
                  วิธีการเขียน
                </Title>
                <Tooltip title="คำแนะนำเพิ่มเติมสำหรับการเขียนในส่วนนี้">
                  <InfoCircleOutlined
                    style={{
                      marginLeft: 8,
                      color: "#6b7280",
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              </div>

              <div style={{ paddingLeft: 16 }}>
                {current.content.map((content, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      marginBottom: 12,
                      padding: "8px 12px",
                      backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <CheckOutlined
                      style={{
                        color: current.borderColor,
                        fontSize: 14,
                        marginRight: 12,
                        marginTop: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Text style={{ fontSize: 15, lineHeight: 1.6, color: "#374151" }}>
                      {content}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            {/* Example */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #e2e8f0",
              }}
            >
              <Title level={5} style={{ margin: "0 0 12px 0", color: "#475569" }}>
                ตัวอย่าง
              </Title>
              <Text
                style={{
                  fontSize: 14,
                  fontStyle: "italic",
                  color: "#64748b",
                  lineHeight: 1.6,
                }}
              >
                {current.example}
              </Text>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0, borderColor: "#e5e7eb" }} />

        {/* Actions */}
        <div
          style={{
            padding: "20px 32px",
            backgroundColor: "#fafbfc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={page === 0 ? onBack : () => setPage(page - 1)}
            style={{
              borderRadius: 12,
              padding: "0 20px",
              height: 40,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            {page === 0 ? "กลับไปหน้าฟอร์ม" : "ย้อนกลับ"}
          </Button>

          <Button
            type="primary"
            onClick={() => (page === total - 1 ? onBack() : setPage(page + 1))}
            style={{
              borderRadius: 12,
              padding: "0 24px",
              height: 40,
              fontWeight: 500,
              backgroundColor: current.borderColor,
              borderColor: current.borderColor,
              display: "flex",
              alignItems: "center",
            }}
          >
            {page === total - 1 ? "เริ่มเขียนเลย" : "หน้าถัดไป"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default FormGuide;
