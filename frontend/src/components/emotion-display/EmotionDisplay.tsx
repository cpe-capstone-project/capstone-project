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

  // collect all SubEmotionAnalysis
  const getAllEmotions = (): ISubEmotion[] => {
    if (!emotionAnalysisResults || emotionAnalysisResults.length === 0) {
      return [];
    }
    const all: ISubEmotion[] = [];
    emotionAnalysisResults.forEach((result) => {
      if (result.SubEmotionAnalysis && result.SubEmotionAnalysis.length > 0) {
        all.push(...result.SubEmotionAnalysis);
      }
    });
    return all;
  };

  const allEmotions = getAllEmotions().sort(
    (a, b) => (b.ConfidencePercentage ?? 0) - (a.ConfidencePercentage ?? 0)
  );

  if (allEmotions.length === 0) {
    return null;
  }

  // Determine which emotion spans to show and whether to show a +N badge
  const total = allEmotions.length;
  // handle edge cases: if maxDisplay <= 0 treat as 1 for badge logic
  const safeMaxDisplay = Math.max(1, Math.floor(maxDisplay));
  const shouldShowBadge = total > safeMaxDisplay;

  // number of actual colored emotion spans to render
  const coloredCount = shouldShowBadge ? Math.max(0, safeMaxDisplay - 1) : safeMaxDisplay;

  const visibleEmotions = allEmotions.slice(0, coloredCount);
  const remainingEmotions = allEmotions.slice(coloredCount);
  const remainingCount = remainingEmotions.length;

  // helper to build tooltip text for the +N badge (shows names)
  const remainingNames = remainingEmotions
    .map((e) => {
      const emo = e.emotions;
      if (!emo) return "";
      // prefer English name if available (Emotionsname), fallback to Thai
      return `${emo.ThaiEmotionsname ?? emo.Emotionsname ?? "Unknown"}`;
    })
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Flex
        gap="var(--space-xxs)"
        className="emotion-diary-container"
        onClick={() => setIsModalOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <p>สรุปอารมณ์</p>

        {visibleEmotions.map((emotionAnalysis) => {
          const emotion = emotionAnalysis.emotions;
          if (!emotion) return null;
          return (
            <Tooltip
              key={emotionAnalysis.ID}
              title={`${emotion.ThaiEmotionsname ?? ""} (${emotion.Emotionsname ?? ""})`}
              placement="bottom"
            >
              <span
                style={{
                  backgroundColor: emotion.EmotionsColor,
                }}
              />
            </Tooltip>
          );
        })}

        {shouldShowBadge && (
          <Tooltip
            title={remainingNames ? `${remainingCount} อารมณ์: ${remainingNames}` : `+${remainingCount} more`}
            placement="bottom"
          >
            <div className="emotion-badge-number"
            >
              <div>{`+${remainingCount}`}</div>
            </div>
          </Tooltip>
        )}
      </Flex>

      {/* Popup modal */}
      <Modal
        title={`All emotions for diary "${diary.Title ?? ""}"`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <List
          dataSource={allEmotions}
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
