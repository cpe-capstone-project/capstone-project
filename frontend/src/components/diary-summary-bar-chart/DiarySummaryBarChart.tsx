import React, { useState } from "react";
import "./DiarySummaryBarChart.css";

const sampleEmotionData = [
  { emotion: "Hangry", percentage: 30, count: 15, color: "#FF4B4B" },
  { emotion: "Sad", percentage: 20, count: 10, color: "#4287F5" },
  { emotion: "Happy", percentage: 50, count: 25, color: "#F5A623" },
];

export default function DiarySummaryBarChart() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  return (
    <div className="emotion-bar-container">
      {/* BARCHART */}
      <div className="emotion-bar">
        {sampleEmotionData.map((item, index) => (
          <div
            key={index}
            className="emotion-segment"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            onMouseEnter={(e) => {
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setTooltip({
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                text: `${item.emotion}: ${item.percentage}% (${item.count} times)`,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* LEGEND */}
      <div className="emotion-legend">
        {sampleEmotionData.map((item, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-dot"
              style={{ backgroundColor: item.color }}
            ></span>
            <span style={{ color: item.color, fontWeight: 500 }}>
              {item.emotion}
            </span>
            <span style={{ color: item.color, marginLeft: "6px" }}>
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* TOOLTIP */}
      {tooltip && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
