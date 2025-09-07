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

// เพิ่ม import จาก date-fns
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// ✅ เพิ่ม Ant Design และ Dayjs
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
// import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import "dayjs/locale/th";
// import DiarySummaryBarChart from "../../components/diary-summary-bar-chart/DiarySummaryBarChart";
import { useTherapyCase } from "../../contexts/TherapyCaseContext";
import DiarySummaryEmotionChart from "../../components/diary-summary-bar-chart/DiarySummaryEmotionChart";
import { useDate } from "../../contexts/DateContext";
// dayjs.locale("th");

function DiarySummary() {
  const { formatLong } = useDate();
  const { getTherapyCaseByPatient } = useTherapyCase();
  const [therapyCaseId, setTherapyCaseId] = useState<number | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("วันนี้");
  const [summaryData, setSummaryData] = useState<DiarySummaryInterface | null>(
    null
  );

  // console.log("summaryData:", summaryData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [customRange, setCustomRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

const calculateDateRange = (timeframe: string) => {
  const now = new Date();
  let startDate: Date, endDate: Date;

  switch (timeframe) {
    case "วันนี้":
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
      
    case "สัปดาห์นี้":
      // date-fns จะเริ่มสัปดาห์จากวันจันทร์ (default)
      // หากต้องการเริ่มจากวันอาทิตย์ ให้เพิ่ม { weekStartsOn: 0 }
      startDate = startOfWeek(now, { weekStartsOn: 0 }); // 0 = อาทิตย์
      endDate = endOfWeek(now, { weekStartsOn: 0 });
      break;
      
    case "เดือนนี้":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
      
    case "เลือกวันเอง":
      if (customRange && customRange[0] && customRange[1]) {
        startDate = startOfDay(customRange[0].toDate());
        endDate = endOfDay(customRange[1].toDate());
      } else {
        // fallback ถ้าไม่มีการเลือกวัน
        startDate = startOfDay(now);
        endDate = endOfDay(now);
      }
      break;
      
    default:
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      break;
  }

  return { startDate, endDate };
  };

  const handleCreateSummary = async () => {
    // localStorage.removeItem("diary_summary_id");
    setIsLoading(true);
    setError("");
    setSummaryData(null);

    if (selectedTimeframe === "เลือกวันเอง") {
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

    try {
      const { startDate, endDate } = calculateDateRange(selectedTimeframe);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // console.log("Timezone:", timezone);
      // console.log("Start Date:", startDate.toISOString());
      // console.log("End Date:", endDate.toISOString());
      // console.log("Therapy Case ID:", therapyCaseId);
      // return;
      const response = await CreateDiarySummary({
        TherapyCaseID: therapyCaseId,
        Timeframe: selectedTimeframe,
        StartDate: startDate.toISOString(),
        EndDate: endDate.toISOString(),
        Timezone: timezone,
      });
      // console.log("Response:", response);

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
    const patientId = Number(localStorage.getItem("id"));


    const fetchData = async () => {
      // ดึง therapy cases ของ patient
      const therapyCases = await getTherapyCaseByPatient(patientId);
      // console.log("Fetched therapyCases:", therapyCases);

      if (therapyCases && typeof therapyCases.ID !== "undefined") {
        setTherapyCaseId(therapyCases.ID);
      }
    };

    fetchData();
  }, []);

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
        <h1><strong>Diary Summary</strong></h1>
        <p>
          เลือกช่วงเวลาสำหรับการสรุปข้อมูลไดอารี่ของคุณ
          โดยการสรุปจะสรุปไดอารี่จากไดอารี่ที่ยืนยันแล้ว (สถานะ Confirmed) เท่านั้น
        </p>

        <div className="timeframe-container">
          {["วันนี้", "สัปดาห์นี้", "เดือนนี้", "เลือกวันเอง"].map((label) => (
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

        {selectedTimeframe === "เลือกวันเอง" && (
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
              <h1><strong>AI Diary Summary</strong> ({summaryData.Timeframe}) {formatLong(summaryData.StartDate ?? "", "th")} - {formatLong(summaryData.EndDate ?? "", "th")}</h1>
              <p>{summaryData.SummaryText}</p>
            </div>
            <div className="summary-keyword-container">
              <h1>Keyword: </h1>
              <p>{summaryData.Keyword}</p>
            </div>
          </div>

          <div className="emotion-summary-container">
            <h1>
              ภาพรวมอารมณ์ – อ้างอิงจากไดอารี่ทั้งหมด{" "}
              {summaryData?.Diaries ? summaryData.Diaries.length : 0} ฉบับ
            </h1>
            <DiarySummaryEmotionChart />
            {/* <DiarySummaryBarChart /> */}
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