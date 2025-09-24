import React, { useState } from "react";
import { Flex, Tooltip, Modal, List } from "antd";
import "./EmotionDisplay.css";
import type { DiaryInterface } from "../../interfaces/IDiary";
import type { IEmotionAnalysisResults } from "../../interfaces/IEmotionAnalysisResults";
import type { ISubEmotion } from "../../interfaces/ISubEmotion";

interface EmotionDisplayProps {
  emotionAnalysisResults: IEmotionAnalysisResults[];
  maxDisplay?: number;
  diary: DiaryInterface;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({
  emotionAnalysisResults,
  maxDisplay = 3,
  diary,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // console.log("EmotionDisplay emotionAnalysisResults:", emotionAnalysisResults);

  // รวม SubEmotionAnalysis ทั้งหมด
  const getAllEmotions = (): ISubEmotion[] => {
    if (!emotionAnalysisResults || emotionAnalysisResults.length === 0) {
      return [];
    }
    const all: ISubEmotion[] = [];
    emotionAnalysisResults.forEach((result) => {
      if (result.SubEmotionAnalysis && result.SubEmotionAnalysis?.length > 0) {
        all.push(...result.SubEmotionAnalysis);
      }
    });
    return all;
  };

  const allEmotions = getAllEmotions();

  // สำหรับ preview สั้น ๆ
  const topEmotions = [...allEmotions]
    .sort((a, b) => (b.ConfidencePercentage ?? 0) - (a.ConfidencePercentage ?? 0))
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
          if (!emotion) return null;
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
        title={`อารมณ์ทั้งหมดของไดอารี่ "${diary.Title ?? ""}"`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={allEmotions.sort(
            (a, b) => (b.ConfidencePercentage ?? 0 ) - (a.ConfidencePercentage  ?? 0)
          )}
          renderItem={(item) => {
            const emotion = item.emotions;
            if (!emotion) return null;
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
