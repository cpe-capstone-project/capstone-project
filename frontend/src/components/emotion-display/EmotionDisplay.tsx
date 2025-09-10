import React, { useState } from "react";
import { Flex, Tooltip, Modal, List } from "antd";
import "./EmotionDisplay.css";

interface Emotion {
  ID: number;
  Emotionsname: string;
  ThaiEmotionsname: string;
  EmotionsColor: string;
  Category: string;
}

interface SubEmotionAnalysis {
  ID: number;
  ConfidencePercentage: number;
  Score: number;
  emotions: Emotion;
}

interface EmotionAnalysisResult {
  ID: number;
  PrimaryEmotion: string;
  SubEmotionAnalysis: SubEmotionAnalysis[];
}

interface EmotionDisplayProps {
  emotionAnalysisResults: EmotionAnalysisResult[];
  maxDisplay?: number;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotionAnalysisResults,
  maxDisplay = 3,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // รวม SubEmotionAnalysis ทั้งหมด
  const getAllEmotions = (): SubEmotionAnalysis[] => {
    if (!emotionAnalysisResults || emotionAnalysisResults.length === 0) {
      return [];
    }
    const all: SubEmotionAnalysis[] = [];
    emotionAnalysisResults.forEach((result) => {
      if (result.SubEmotionAnalysis?.length > 0) {
        all.push(...result.SubEmotionAnalysis);
      }
    });
    return all;
  };

  const allEmotions = getAllEmotions();

  // สำหรับ preview สั้น ๆ
  const topEmotions = [...allEmotions]
    .sort((a, b) => b.ConfidencePercentage - a.ConfidencePercentage)
    .slice(0, maxDisplay);

  if (allEmotions.length === 0) {
    return null;
  }

  return (
    <>
      <Flex
        gap="var(--space-xxs)"
        className="emotion-diary-container"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <p>สรุปอารมณ์</p>
        {topEmotions.map((emotionAnalysis) => {
          const emotion = emotionAnalysis.emotions;
          return (
            <Tooltip
              key={emotionAnalysis.ID}
              title={`${emotion.ThaiEmotionsname} (${emotion.Emotionsname})`}
              placement="bottom"
            >
              <span style={{ backgroundColor: emotion.EmotionsColor }} />
            </Tooltip>
          );
        })}
      </Flex>

      {/* Popup modal */}
      <Modal
        title="อารมณ์ทั้งหมด"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={allEmotions.sort(
            (a, b) => b.ConfidencePercentage - a.ConfidencePercentage
          )}
          renderItem={(item) => {
            const emotion = item.emotions;
            return (
              <List.Item key={item.ID}>
                <Flex justify="space-between" style={{ width: "100%" }}>
                  <Flex align="center" gap={8}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: emotion.EmotionsColor,
                      }}
                    />
                    <span>
                      {emotion.ThaiEmotionsname} ({emotion.Emotionsname})
                    </span>
                  </Flex>
                </Flex>
              </List.Item>
            );
          }}
        />
      </Modal>
    </>
  );
};

export default EmotionDisplay;
