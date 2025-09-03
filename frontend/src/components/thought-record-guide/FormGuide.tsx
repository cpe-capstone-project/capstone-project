import React, { useState } from "react";
import { Card, Typography, Button, Space, Divider, Steps, Tooltip } from "antd";
import { ArrowLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { MdEvStation } from "react-icons/md";
import { FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";

const { Title, Paragraph, Text } = Typography;

interface FormGuideProps {
  onBack: () => void;
}

const guidePages = [
  {
    title: "หน้าที่ 1",
    field: "สถานการณ์ (Situation)",
    icon: <MdEvStation style={{ color: "#059669", marginRight: 8 }} />,
    content: [
      "บันทึกเหตุการณ์ที่เกิดขึ้น",
      "ระบุสถานที่ เวลา และรายละเอียดโดยรอบ",
      "เขียนให้ชัดเจนพอที่คุณกลับมาอ่านจะเข้าใจได้ทันที",
    ],
  },
  {
    title: "หน้าที่ 2",
    field: "ความคิด (Thoughts)",
    icon: <FaRegCommentDots style={{ color: "#dc2626", marginRight: 8 }} />,
    content: [
      "บันทึกความคิดที่ผุดขึ้นในตอนนั้น",
      "เขียนทั้งความคิดด้านบวกและด้านลบ",
      "ไม่ต้องตัดสินว่าดีหรือไม่ดี แค่บันทึกตามจริง",
    ],
  },
  {
    title: "หน้าที่ 3",
    field: "พฤติกรรม (Behaviors)",
    icon: <GiDramaMasks style={{ color: "#7c3aed", marginRight: 8 }} />,
    content: [
      "ระบุสิ่งที่คุณทำหลังจากเกิดความคิดนั้น",
      "อาจเป็นการพูด การแสดงออก หรือการกระทำ",
      "เขียนเพื่อเห็นผลของความคิดที่มีต่อพฤติกรรม",
    ],
  },
  {
    title: "หน้าที่ 4",
    field: "ความคิดทางเลือก (Alternate Thought)",
    icon: <FaRedoAlt style={{ color: "#ea580c", marginRight: 8 }} />,
    content: [
      "ลองหาความคิดอื่นที่สมดุลกว่า",
      "เขียนสิ่งที่เป็นไปได้จริง และช่วยให้คุณรู้สึกดีขึ้น",
      "ยกตัวอย่างเช่น ‘มันอาจไม่ได้แย่อย่างที่คิด’",
    ],
  },
];

function FormGuide({ onBack }: FormGuideProps) {
  const [page, setPage] = useState(0);
  const current = guidePages[page];
  const total = guidePages.length;

  return (
    <Card
      style={{
        borderRadius: 16,
        padding: 24,
        transition: "all 0.3s ease",
        backgroundColor: "white", // เปลี่ยนเป็นสีขาว
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Progress Steps */}
        <Steps
          current={page}
          size="small"
          style={{ marginBottom: 24 }}
          items={guidePages.map((p) => ({ title: p.field }))}
        />

        {/* Header */}
        <Title level={3}>{current.title}</Title>
        <Text type="secondary">
          หน้าที่ {page + 1} จาก {total}
        </Text>
        <Divider />

        {/* Field */}
        <Title level={4} style={{ marginTop: 0, display: "flex", alignItems: "center" }}>
          {current.icon}
          {current.field}
          <Tooltip title="ตัวอย่างวิธีเขียนหรือคำแนะนำเพิ่มเติม">
            <InfoCircleOutlined style={{ marginLeft: 8, color: "#555" }} />
          </Tooltip>
        </Title>

        {/* Content List */}
        {current.content.map((c, i) => (
          <Paragraph key={i}>• <Text>{c}</Text></Paragraph>
        ))}

        <Divider />

        {/* Actions */}
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={page === 0 ? onBack : () => setPage(page - 1)}
          >
            {page === 0 ? "กลับไปหน้าฟอร์ม" : "ย้อนกลับ"}
          </Button>

          <Button
            type="primary"
            onClick={() =>
              page === total - 1 ? onBack() : setPage(page + 1)
            }
          >
            {page === total - 1 ? "เสร็จสิ้น" : "หน้าถัดไป"}
          </Button>
        </Space>
      </Space>
    </Card>
  );
}

export default FormGuide;
