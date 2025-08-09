import React, { useMemo, useState } from "react";
import { Card, Segmented, Tooltip as AntdTooltip } from "antd";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth, addDays, addWeeks, addMonths, isSameWeek, isSameMonth } from "date-fns";
import { th } from "date-fns/locale";

// ---- Types ----
export type DiaryLite = {
  ID?: number | string;
  CreatedAt?: string | Date;
  UpdatedAt?: string | Date;
};

type Mode = "daily" | "weekly" | "monthly";

interface DiaryStatsChartProps {
  diaries: DiaryLite[];
  /** Which date field to count by */
  dateField?: "UpdatedAt" | "CreatedAt";
  /** How many buckets to display */
  dailyDays?: number; // default 7
  weeklyWeeks?: number; // default 8
  monthlyMonths?: number; // default 12
  className?: string;
}

// ---- Helpers ----
const getDate = (d: any) => (d instanceof Date ? d : new Date(d));

function buildDailyData(diaries: DiaryLite[], field: "UpdatedAt" | "CreatedAt", days = 7) {
  const end = startOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));
  const buckets: { label: string; key: string; start: Date }[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(start, i);
    buckets.push({
      label: format(day, "dd MMM", { locale: th }),
      key: format(day, "yyyy-MM-dd"),
      start: day,
    });
  }

  const counts = buckets.map((b) => ({ label: b.label, value: 0 }));

  diaries.forEach((d) => {
    const base = getDate(d[field]);
    if (!base || isNaN(base.getTime())) return;
    const dayKey = format(startOfDay(base), "yyyy-MM-dd");
    const idx = buckets.findIndex((b) => b.key === dayKey);
    if (idx >= 0) counts[idx].value += 1;
  });

  return counts;
}

function buildWeeklyData(diaries: DiaryLite[], field: "UpdatedAt" | "CreatedAt", weeks = 8) {
  const end = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
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

  diaries.forEach((d) => {
    const base = getDate(d[field]);
    if (!base || isNaN(base.getTime())) return;
    const idx = buckets.findIndex((b) => isSameWeek(base, b.start, { weekStartsOn: 1 }));
    if (idx >= 0) counts[idx].value += 1;
  });

  return counts;
}

function buildMonthlyData(diaries: DiaryLite[], field: "UpdatedAt" | "CreatedAt", months = 12) {
  const end = startOfMonth(new Date());
  const start = startOfMonth(subMonths(end, months - 1));

  const buckets: { start: Date; label: string }[] = [];
  for (let i = 0; i < months; i++) {
    const mStart = addMonths(start, i);
    buckets.push({
      start: mStart,
      label: format(mStart, "MMM yyyy", { locale: th }),
    });
  }

  const counts = buckets.map((b) => ({ label: b.label, value: 0 }));

  diaries.forEach((d) => {
    const base = getDate(d[field]);
    if (!base || isNaN(base.getTime())) return;
    const idx = buckets.findIndex((b) => isSameMonth(base, b.start));
    if (idx >= 0) counts[idx].value += 1;
  });

  return counts;
}

// ---- Component ----
const DiaryStatsChart: React.FC<DiaryStatsChartProps> = ({
  diaries,
  dateField = "UpdatedAt",
  dailyDays = 7,
  weeklyWeeks = 8,
  monthlyMonths = 12,
  className,
}) => {
  const [mode, setMode] = useState<Mode>("daily");

  const data = useMemo(() => {
    if (!Array.isArray(diaries)) return [];
    switch (mode) {
      case "daily":
        return buildDailyData(diaries, dateField, dailyDays);
      case "weekly":
        return buildWeeklyData(diaries, dateField, weeklyWeeks);
      case "monthly":
        return buildMonthlyData(diaries, dateField, monthlyMonths);
    }
  }, [diaries, mode, dateField, dailyDays, weeklyWeeks, monthlyMonths]);

  const total = useMemo(() => data.reduce((s, d) => s + (d.value || 0), 0), [data]);

  return (
    <Card
      className={className}
      styles={{ body: { padding: 16 } }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>สรุปการจดบันทึก Diary</span>
          <AntdTooltip title="เลือกช่วงเวลาที่ต้องการดูสถิติ">
            <span style={{ fontSize: 12, color: "#6b7280" }}>(รวม {total} รายการ)</span>
          </AntdTooltip>
        </div>
      }
      extra={
        <Segmented
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          options={[
            { label: "รายวัน", value: "daily" },
            { label: "รายสัปดาห์", value: "weekly" },
            { label: "รายเดือน", value: "monthly" },
          ]}
        />
      }
    >
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={0} height={40} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any) => [`${value} รายการ`, "จำนวนบันทึก"]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tiny legend / caption */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "#6b7280", fontSize: 12 }}>
        <div>นับตาม: {dateField === "UpdatedAt" ? "วันที่แก้ไข" : "วันที่สร้าง"}</div>
        <div>แสดง: {mode === "daily" ? `${dailyDays} วันล่าสุด` : mode === "weekly" ? `${weeklyWeeks} สัปดาห์ล่าสุด` : `${monthlyMonths} เดือนล่าสุด`}</div>
      </div>
    </Card>
  );
};

export default DiaryStatsChart;
