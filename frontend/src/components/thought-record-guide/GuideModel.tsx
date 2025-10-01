import React, { useState } from "react";
import { Modal, Table, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";

type GuideType = "situation" | "thoughts" | "behaviors" | "alternate";

interface GuideButtonProps {
  type?: GuideType;
  formGuide?: boolean;
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

  {
    key: "3",
    Situation:
      "ทุกคนยุ่งกันหมด เลยทำให้ฉันต้องใช้เวลาเย็นนี้อยู่คนเดียวโดยไม่มีแผนอะไรเลย",
    Thoughts: "ไม่มีใครอยากมาเจอฉันเลย ฉันแค่กำลังเสียเวลา นั่งอยู่คนเดียวแบบนี้",
    Behaviors: "อยู่บ้านทั้งคืน ไม่ได้ทำอะไร นั่งคิดแต่เรื่องแย่ ๆ",
    AlternateThought:
      "ฉันอยู่คนเดียวคืนนี้ก็จริง แต่ทุกคนก็ต้องมีช่วงที่อยู่คนเดียวเหมือนกัน ฉันสามารถทำสิ่งที่อยากทำได้",
  },
  {
    key: "4",
    Situation: "มีงานที่โรงเรียนซึ่งยากและใกล้ถึงกำหนดส่ง",
    Thoughts: "งานนี้เยอะเกินไป ฉันแย่มากกับเรื่องพวกนี้ ฉันไม่คิดว่าจะทำได้",
    Behaviors: "เลี่ยงงานจนถึงนาทีสุดท้าย ต้องรีบทำงานให้เสร็จ",
    AlternateThought:
      "นี่เป็นงานที่ยากและต้องใช้ความพยายามมาก แต่ฉันรู้ว่าฉันทำได้ ถ้าแบ่งออกเป็นส่วนเล็ก ๆ แล้วทำไปทีละขั้น จัดเป็นตาราง",
  },
];

const GuideButton: React.FC<GuideButtonProps> = ({ type, formGuide }) => {
  const [open, setOpen] = useState(false);
  const [highlightType, setHighlightType] = useState<GuideType | null>(null);
  const [hovered, setHovered] = useState(false);

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
            setHighlightType(null);
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
        <Button
          type="default"
          shape="round"
          size="small"
          icon={<EyeOutlined />}
          style={{
            fontSize: 12,
            marginLeft: 8,
            backgroundColor: hovered ? "#e6f0ff" : "#f0f5ff",
            color: "#1677ff",
            border: hovered ? "1px solid #1677ff" : "none",
            transition: "all 0.3s ease",
          }}
          onClick={() => {
            setHighlightType(type);
            setOpen(true);
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          ดูตัวอย่าง
        </Button>

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
