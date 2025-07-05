import React, { useState } from "react";
import "./DiarySummary.css";
import BlurredCirclesBackground from "../../components/background-blur/BlurredCirclesBackground";

function DiarySummary() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("Weekly");
  const tags = [
    "Happy",
    "Sad",
    "Anxious",
    "Calm",
    "Angry",
    "Excited",
    "Tired",
    "Confused",
  ];

  return (
    <section className="diary-summary-container">
      {/* header */}
      <div className="diary-summary-header">
        <h1>Diary Summary</h1>
        <p>เลือกช่วงเวลาสำหรับการสรุปข้อมูลไดอารี่ของคุณ</p>

        <div className="timeframe-container">
          {["Daily", "Weekly", "Monthly"].map((label) => (
            <label
              key={label}
              className={`timeframe-option ${
                selectedTimeframe === label ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="timeframe"
                value={label}
                checked={selectedTimeframe === label}
                onChange={() => setSelectedTimeframe(label)}
                className="timeframe-input"
              />
              <span className="timeframe-label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="diary-summary-content">
        <h1>สรุปโดย AI (Artificial Intelligence)</h1>
        <div className="p-4">
          <div className="summary-card">
            <BlurredCirclesBackground />
            <div className="summary-card-content">
              <p className="summary-text">
                This week, you've expressed feelings of anxiety and stress,
                particularly related to work and social interactions. You've
                also shown resilience in managing these emotions through
                mindfulness exercises.
              </p>
            </div>
          </div>
        </div>
        
        <h1>อารมณ์โดยรวม</h1>
        <div className="tags-container">
          {tags.map((tag) => (
            <div key={tag} className="tag-item">
              <p className="tag-text">{tag}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DiarySummary;
