import React from "react";
import { Modal, Space, Descriptions } from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { EmotionsInterface } from "../../interfaces/IEmotions";

interface ThoughtRecordFormValues {
  TagColors: string;
  Situation: string;
  Thoughts: string;
  EmotionsID: number[];
  SituationTagID: number;
  Behaviors: string;
  AlternateThought: string;
}

interface ThoughtRecordSubmitProps {
  visible: boolean;
  loading: boolean;
  pendingValues: ThoughtRecordFormValues | null;
  emotions: EmotionsInterface[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ThoughtRecordSubmit: React.FC<ThoughtRecordSubmitProps> = ({
  visible,
  loading,
  pendingValues,
  emotions,
  onConfirm,
  onCancel,
}) => {
  // ฟังก์ชันแสดงชื่ออารมณ์
  const getEmotionNames = (emotionIds: number[]) => {
    if (!Array.isArray(emotionIds) || emotionIds.length === 0) return "ไม่ได้เลือก";
    return emotionIds
      .map((id) => {
        const emotion = emotions.find((e) => e.ID === id);
        return emotion?.ThaiEmotionsname || emotion?.Emotionsname || "ไม่ระบุ";
      })
      .join(", ");
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          ยืนยันการบันทึกข้อมูล
        </Space>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="ยืนยันบันทึก"
      cancelText="ยกเลิก"
      width={700}
      okButtonProps={{ icon: <CheckCircleOutlined />, loading: loading }}
    >
      <div style={{ marginTop: 16 }}>
        <p style={{ marginBottom: 16, color: "#666" }}>
          กรุณาตรวจสอบข้อมูลก่อนบันทึก หากกดบันทึกแล้วจะไม่สามารถแก้ไขได้
        </p>

        {pendingValues && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="สีหัวข้อบันทึก">
              <Space>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: pendingValues.TagColors,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                />
                {pendingValues.TagColors}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="สถานการณ์">
              <div style={{ maxHeight: 60, overflow: "auto" }}>
                {pendingValues.Situation || "ไม่ได้กรอก"}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="ความคิด">
              <div style={{ maxHeight: 60, overflow: "auto" }}>
                {pendingValues.Thoughts || "ไม่ได้กรอก"}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="อารมณ์">
              {getEmotionNames(pendingValues.EmotionsID)}
            </Descriptions.Item>

            <Descriptions.Item label="พฤติกรรม">
              <div style={{ maxHeight: 60, overflow: "auto" }}>
                {pendingValues.Behaviors || "ไม่ได้กรอก"}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="ความคิดทางเลือก">
              <div style={{ maxHeight: 60, overflow: "auto" }}>
                {pendingValues.AlternateThought || "ไม่ได้กรอก"}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
    </Modal>
  );
};

export default ThoughtRecordSubmit;
