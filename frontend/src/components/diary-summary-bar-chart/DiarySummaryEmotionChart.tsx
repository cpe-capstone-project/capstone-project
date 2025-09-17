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
  emotionNameEng: string;
  emotionNameThai: string;
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

      if (
        !res ||
        !res.data ||
        !res.data.emotions ||
        !res.data.emotions.length
      ) {
        setData([]);
        return;
      }

      // map ให้ตรงกับ interface
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: EmotionCount[] = res.data.emotions.map((e: any) => ({
        emotionNameEng: e.emotion_name_eng,
        emotionNameThai: e.emotion_name_thai,
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
            dataKey="emotionNameEng"
            interval={0}
            height={60} // เพิ่มความสูงให้รองรับ 2 บรรทัด
            tick={({ x, y, payload }) => {
              const emo = data.find((d) => d.emotionNameEng === payload.value);
              // Always return a valid SVG element, even if not found
              return (
                <text x={x} y={y + 10} textAnchor="middle" fontSize={12}>
                  <tspan x={x} dy="0">
                    {emo ? emo.emotionNameThai : payload.value}
                  </tspan>
                  <tspan x={x} dy="14">
                    {emo ? `(${emo.emotionNameEng})` : ""}
                  </tspan>
                </text>
              );
            }}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            domain={[0, 100]} // ตั้งค่า 0-100
            unit="%" // แสดงหน่วย %
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name, props) => {
              const emo = data.find(
                (d) => d.emotionNameEng === props.payload.emotionNameEng
              );
              return [`${value}% (จำนวน ${emo ? emo.count : 0})`, "เปอร์เซ็นต์"];
            }}
            labelFormatter={(label) => {
              const emo = data.find((d) => d.emotionNameEng === label);
              if (!emo) return label;

              return (
                <span>
                  อารมณ์: {emo.emotionNameThai} ({emo.emotionNameEng})
                </span>
              );
            }}
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
