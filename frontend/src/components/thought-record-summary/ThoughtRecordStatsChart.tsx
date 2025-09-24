import React, { useMemo, useState, useEffect } from "react";
import { Card, Segmented, Spin } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  addDays,
  addWeeks,
  addMonths,
  isSameWeek,
  isSameMonth,
} from "date-fns";
import { th } from "date-fns/locale";
import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord";
import { GetThoughtRecords } from "../../services/https/ThoughtRecord";
import "./ThoughtRecordStatsChart.css";

type Mode = "daily" | "weekly" | "monthly";

interface ThoughtRecordStatsChartProps {
  dateField?: "UpdatedAt" | "CreatedAt";
  dailyDays?: number;
  weeklyWeeks?: number;
  monthlyMonths?: number;
  className?: string;
}

function normalizeDateField(d: any, field: "UpdatedAt" | "CreatedAt"): Date | null {
  if (!d) return null;
  const candidates = [
    d[field],
    d[field.toLowerCase()],
    d[field === "UpdatedAt" ? "updated_at" : "created_at"],
    d[field === "UpdatedAt" ? "updatedAt" : "createdAt"],
  ];
  const raw = candidates.find(Boolean);
  if (!raw) return null;
  const date = typeof raw === "string" ? new Date(raw.replace(" ", "T")) : new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

const isEmptyData = (arr?: Array<{ value?: number }>) =>
  !arr || arr.length === 0 || arr.every((x) => !x?.value || x.value === 0);

// ---- Build Data Functions ----
function buildDailyData(thoughtRecords: ThoughtRecordInterface[], field: "UpdatedAt" | "CreatedAt", days = 7) {
  const end = startOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));
  const buckets: { label: string; key: string; start: Date }[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(start, i);
    buckets.push({ label: format(day, "dd MMM", { locale: th }), key: format(day, "yyyy-MM-dd"), start: day });
  }
  const counts = buckets.map((b) => ({ label: b.label, value: 0 }));
  thoughtRecords.forEach((tr) => {
    const base = normalizeDateField(tr, field);
    if (!base) return;
    const dayKey = format(startOfDay(base), "yyyy-MM-dd");
    const idx = buckets.findIndex((b) => b.key === dayKey);
    if (idx >= 0) counts[idx].value += 1;
  });
  return counts;
}

function buildWeeklyData(thoughtRecords: ThoughtRecordInterface[], field: "UpdatedAt" | "CreatedAt", weeks = 8) {
  const end = startOfWeek(new Date(), { weekStartsOn: 1 });
  const start = startOfWeek(subWeeks(end, weeks - 1), { weekStartsOn: 1 });
  const buckets: { start: Date; label: string }[] = [];
  for (let i = 0; i < weeks; i++) {
    const wStart = addWeeks(start, i);
    const wEnd = addDays(wStart, 6);
    buckets.push({
      start: wStart,
      label: `${format(wStart, "dd MMM", { locale: th })} - ${format(wEnd, "dd MMM", { locale: th })}`,
    });
  }
  const counts = buckets.map((b) => ({ label: b.label, value: 0 }));
  thoughtRecords.forEach((tr) => {
    const base = normalizeDateField(tr, field);
    if (!base) return;
    const idx = buckets.findIndex((b) => isSameWeek(base, b.start, { weekStartsOn: 1 }));
    if (idx >= 0) counts[idx].value += 1;
  });
  return counts;
}

function buildMonthlyData(thoughtRecords: ThoughtRecordInterface[], field: "UpdatedAt" | "CreatedAt", months = 12) {
  const end = startOfMonth(new Date());
  const start = startOfMonth(subMonths(end, months - 1));
  const buckets: { start: Date; label: string }[] = [];
  for (let i = 0; i < months; i++) {
    const mStart = addMonths(start, i);
    buckets.push({ start: mStart, label: format(mStart, "MMM yyyy", { locale: th }) });
  }
  const counts = buckets.map((b) => ({ label: b.label, value: 0 }));
  thoughtRecords.forEach((tr) => {
    const base = normalizeDateField(tr, field);
    if (!base) return;
    const idx = buckets.findIndex((b) => isSameMonth(base, b.start));
    if (idx >= 0) counts[idx].value += 1;
  });
  return counts;
}

// ---- Component ----
const ThoughtRecordStatsChart: React.FC<ThoughtRecordStatsChartProps> = ({
  dateField = "UpdatedAt",
  dailyDays = 7,
  weeklyWeeks = 8,
  monthlyMonths = 12,
  className,
}) => {
  const [mode, setMode] = useState<Mode>("daily");
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecordInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const patientId = 1;
        const therapyCaseId = 1;
        const res = await GetThoughtRecords(patientId, therapyCaseId, "UpdatedAt", "desc");
        setThoughtRecords(res || []);
      } catch (e) {
        console.error("Failed to fetch ThoughtRecords", e);
        setThoughtRecords([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const data = useMemo(() => {
    if (!Array.isArray(thoughtRecords)) return [];
    switch (mode) {
      case "daily":
        return buildDailyData(thoughtRecords, dateField, dailyDays);
      case "weekly":
        return buildWeeklyData(thoughtRecords, dateField, weeklyWeeks);
      case "monthly":
        return buildMonthlyData(thoughtRecords, dateField, monthlyMonths);
      default:
        return [];
    }
  }, [thoughtRecords, mode, dateField, dailyDays, weeklyWeeks, monthlyMonths]);

  const total = useMemo(() => (data ?? []).reduce((s, d) => s + (d.value || 0), 0), [data]);
  const showEmpty = !thoughtRecords?.length || isEmptyData(data);

  return (
    <div className={`thought-record-summary-container ${className ?? ""}`}>
      <div className="diary-summary-header">
        <h1>สรุปการทำ Thought Record</h1>
        <p>รวม {total} รายการ</p>
        <div className="timeframe-container">
          {["daily", "weekly", "monthly"].map((v) => (
            <div
              key={v}
              className={`timeframe-option ${mode === v ? "selected" : ""}`}
              onClick={() => setMode(v as Mode)}
            >
              <span className="timeframe-label">
                {v === "daily" ? "รายวัน" : v === "weekly" ? "รายสัปดาห์" : "รายเดือน"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      ) : showEmpty ? (
        <div className="thought-record-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/128/109/109827.png"
            alt="empty"
            width={56}
            height={56}
          />
          <div>ยังไม่มี Thought Record ในช่วงเวลานี้</div>
          <div style={{ fontSize: 12 }}>เริ่มบันทึก Thought Record วันนี้ เพื่อดูสถิติที่นี่</div>
        </div>
      ) : (
        <div className="diary-summary-content">
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="thoughtRecordGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4caf50" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2196f3" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} height={40} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} รายการ`, "จำนวน Thought Record"]}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#thoughtRecordGradient)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="thought-record-footer">
            <div>นับตาม: {dateField === "UpdatedAt" ? "วันที่แก้ไข" : "วันที่สร้าง"}</div>
            <div>
              แสดง:{" "}
              {mode === "daily"
                ? `${dailyDays} วันล่าสุด`
                : mode === "weekly"
                ? `${weeklyWeeks} สัปดาห์ล่าสุด`
                : `${monthlyMonths} เดือนล่าสุด`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtRecordStatsChart;
