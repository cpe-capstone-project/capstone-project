import React, { useEffect, useState } from "react";
import BlurredCirclesBackground from "../../components/background-blur/BlurredCirclesBackground";
import Lottie from "lottie-react";
import {
  CreateDiarySummary,
  GetDiarySummaryById,
} from "../../services/https/Diary";
import type { DiarySummaryInterface } from "../../interfaces/IDiarySummary";
// import AILoading from "../../assets/loading/Ai loading model.gif"
import loadingAnimation from "../../assets/loading/Material wave loading.json";
import "./DiarySummary.css";

// ✅ เพิ่ม Ant Design และ Dayjs
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import "dayjs/locale/th";
dayjs.locale("th");

function DiarySummary() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("รายวัน");
  const [summaryData, setSummaryData] = useState<DiarySummaryInterface | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(null);
  // const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(null);
  const [customRange, setCustomRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

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

  const calculateDateRange = (timeframe: string) => {
    const now = new Date();
    let startDate = new Date(),
      endDate = new Date();

    switch (timeframe) {
      case "รายวัน":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "รายสัปดาห์": {
        const offset = now.getDay() === 0 ? -6 : 1 - now.getDay();
        startDate.setDate(now.getDate() + offset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "รายเดือน":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "กำหนดเอง":
        if (customRange && customRange[0] && customRange[1]) {
          startDate = new Date(customRange[0].startOf("day").toISOString());
          endDate = new Date(customRange[1].endOf("day").toISOString());
        }
        break;
    }

    return { startDate, endDate };
  };

  const handleCreateSummary = async () => {
    localStorage.removeItem("diary_summary_id");
    setIsLoading(true);
    setError("");
    setSummaryData(null);

    if (selectedTimeframe === "กำหนดเอง") {
      if (!customRange || !customRange[0] || !customRange[1]) {
        setError("กรุณาเลือกช่วงวันที่ให้ครบถ้วน");
        setIsLoading(false);
        return;
      }
      if (customRange[0].isAfter(customRange[1])) {
        setError("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด");
        setIsLoading(false);
        return;
      }
    }
    console.log("selectedTimeframe:", selectedTimeframe);

    try {
      const { startDate, endDate } = calculateDateRange(selectedTimeframe);
      console.log("Start Date:", startDate.toISOString());
      console.log("End Date:", endDate.toISOString());
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await CreateDiarySummary({
        TherapyCaseID: 1,
        Timeframe: selectedTimeframe,
        StartDate: startDate.toISOString(),
        EndDate: endDate.toISOString(),
        Timezone: timezone,
      });

      if (response.status === 200 && response.data?.summary) {
        const summary = response.data.summary;
        localStorage.setItem("diary_summary_id", summary.ID.toString());
        setSummaryData(summary);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadFromStorage = async () => {
      const id = parseInt(localStorage.getItem("diary_summary_id") || "0");
      if (!id) return;
      const summary = await GetDiarySummaryById(id);
      if (summary?.status === 200) {
        setSummaryData(summary.data);
      }
    };
    loadFromStorage();
  }, []);

  return (
    <section className="diary-summary-container">
      <div className="diary-summary-header">
        <h1>Diary Summary</h1>
        <p>เลือกช่วงเวลาสำหรับการสรุปข้อมูลไดอารี่ของคุณ</p>

        <div className="timeframe-container">
          {["รายวัน", "รายสัปดาห์", "รายเดือน", "กำหนดเอง"].map((label) => (
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

        {selectedTimeframe === "กำหนดเอง" && (
          <div className="custom-date-container">
            <label>เลือกช่วงวันที่:</label>
            <RangePicker
              value={customRange}
              onChange={(values) => setCustomRange(values)}
              format="DD/MM/YYYY"
              placeholder={["วันที่เริ่มต้น", "วันที่สิ้นสุด"]}
            />
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <Lottie
            className="loading-animation"
            animationData={loadingAnimation}
            loop={true}
          />
        </div>
      )}

      {summaryData && (
        <div className="diary-summary-content">
          <div className="summary-card">
            <BlurredCirclesBackground />
            <div className="summary-card-content">
              <h1>AI Diary Summary ({summaryData.Timeframe})</h1>
              <p>{summaryData.SummaryText}</p>
            </div>
          </div>

          <h1>Keyword: {summaryData.Keyword}</h1>

          <h1>อารมณ์โดยรวม</h1>
          <div className="tags-container">
            {tags.map((tag) => (
              <div key={tag} className="tag-item">
                <p>{tag}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="summary-button-container">
        <button
          onClick={handleCreateSummary}
          disabled={isLoading}
          className="summary-button"
        >
          {isLoading ? "กำลังสรุปข้อมูลโปรดรอสักครู่" : "เริ่มสรุปไดอารี่"}
        </button>
      </div>
    </section>
  );
}

export default DiarySummary;
