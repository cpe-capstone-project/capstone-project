import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GetDiarySummaryEmotionStatsById } from "../../services/https/Diary";
import "./DiarySummaryEmotionChart.css";

interface EmotionCount {
  emotionName: string;
  color: string;
  count: number;
  percentage: number;
}

interface Props {
  className?: string;
}

const DiarySummaryEmotionChart: React.FC<Props> = ({ className }) => {
  const [data, setData] = useState<EmotionCount[]>([]);

  useEffect(() => {
    const diarySummaryIdStr = localStorage.getItem("diary_summary_id");
    if (!diarySummaryIdStr) return;

    const diarySummaryId = Number(diarySummaryIdStr);
    if (isNaN(diarySummaryId)) return;

    fetchEmotionStats(diarySummaryId);
  }, []);

  const fetchEmotionStats = async (summaryID: number) => {
    try {
      const res = await GetDiarySummaryEmotionStatsById(summaryID);

      // ตรวจสอบว่ามี data.emotions หรือไม่
      if (
        !res ||
        !res.data ||
        !res.data.emotions ||
        !res.data.emotions.length
      ) {
        setData([]);
        return;
      }

      // แปลงชื่อ field ให้ตรงกับ interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = res.data.emotions.map((e: any) => ({
        emotionName: e.emotion_name,
        color: e.color,
        count: e.count,
        percentage: e.percentage,
      }));

      setData(mapped);
    } catch (error) {
      console.error("Failed to fetch emotion stats", error);
      setData([]);
    }
  };

  return (
    <div style={{ width: "100%", height: 320 }} className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="emotionName"
            tick={{ fontSize: 12 }}
            interval={0}
            height={40}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 100]} // ตั้งค่า 0-100
            unit="%" // แสดงหน่วย %
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value}%`, "เปอร์เซ็นต์"]}
            labelFormatter={(label) => `อารมณ์: ${label}`}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiarySummaryEmotionChart;
