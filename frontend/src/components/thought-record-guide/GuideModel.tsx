import React, { useState } from "react";
import { Modal, Typography, Table, Button } from "antd";

const { Text } = Typography;

type GuideType = "situation" | "thoughts" | "behaviors" | "alternate";

interface GuideButtonProps {
  type?: GuideType; // สำหรับปุ่มตัวอย่าง field
  formGuide?: boolean; // ถ้าเป็นปุ่ม "การกรอกฟอร์ม" จะใช้ prop นี้
}

const titleMap: Record<GuideType, string> = {
  situation: "สถานการณ์",
  thoughts: "ความคิด",
  behaviors: "พฤติกรรม",
  alternate: "ความคิดทางเลือก",
};

// ตัวอย่างข้อมูล
const formData = [
  {
    key: "1",
    Situation: "สอบตก",
    Thoughts: "ฉันไม่เก่งพอ",
    Behaviors: "ร้องไห้",
    AlternateThought: "ครั้งหน้าจะเตรียมตัวให้ดีกว่านี้",
  },
  {
    key: "2",
    Situation: "เรียนได้เกรดน้อย",
    Thoughts: "เราจะล้มเหลวอีกแน่ๆ",
    Behaviors: "เก็บตัว",
    AlternateThought: "ฉันยังมีโอกาสแก้ไข",
  },
];

const GuideButton: React.FC<GuideButtonProps> = ({ type, formGuide }) => {
  const [open, setOpen] = useState(false);
  const [highlightType, setHighlightType] = useState<GuideType | null>(null);

  const columns = [
    {
      title: "สถานการณ์",
      dataIndex: "Situation",
      key: "Situation",
      className: highlightType === "situation" ? "highlight-col" : "",
    },
    {
      title: "ความคิด",
      dataIndex: "Thoughts",
      key: "Thoughts",
      className: highlightType === "thoughts" ? "highlight-col" : "",
    },
    {
      title: "พฤติกรรม",
      dataIndex: "Behaviors",
      key: "Behaviors",
      className: highlightType === "behaviors" ? "highlight-col" : "",
    },
    {
      title: "ความคิดทางเลือก",
      dataIndex: "AlternateThought",
      key: "AlternateThought",
      className: highlightType === "alternate" ? "highlight-col" : "",
    },
  ];

  // ปุ่ม "การกรอกฟอร์ม"
  if (formGuide) {
    return (
      <>
        <Button
          type="link"
          style={{ padding: 0, fontSize: 14, color: "#1677ff" }}
          onClick={() => {
            setHighlightType(null); // ไม่ไฮไลต์
            setOpen(true);
          }}
        >
          การกรอกฟอร์ม
        </Button>

        <Modal
          title="ตัวอย่างการกรอกฟอร์ม"
          open={open}
          footer={null}
          width={700}
          onCancel={() => setOpen(false)}
        >
          <Table
            columns={columns}
            dataSource={formData}
            pagination={false}
            bordered
          />
        </Modal>
      </>
    );
  }

  // ปุ่ม "ดูตัวอย่าง" ของ field
  if (type) {
    return (
      <>
        <Text
          style={{ fontSize: "12px", color: "#1677ff", cursor: "pointer", marginLeft: 8 }}
          onClick={() => {
            setHighlightType(type);
            setOpen(true);
          }}
        >
          (ดูตัวอย่าง)
        </Text>

        <Modal
          title={`ตัวอย่าง - ${titleMap[type]}`}
          open={open}
          footer={null}
          width={700}
          onCancel={() => setOpen(false)}
        >
          <Table
            columns={columns}
            dataSource={formData}
            pagination={false}
            bordered
          />
        </Modal>
      </>
    );
  }

  return null;
};

export default GuideButton;
