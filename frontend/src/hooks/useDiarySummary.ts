// src/hooks/useDiarySummary.ts
import { useState } from "react";
import { CreateDiarySummary } from "../services/https/Diary";

export const TAGS = [
  "Happy","Sad","Anxious","Calm",
  "Angry","Excited","Tired","Confused",
];

const norm = (s: string) => s.trim().toLowerCase();

export type Tab = "daily" | "weekly" | "monthly";

const tabToLabelTH = (tab: Tab): "รายวัน"|"รายสัปดาห์"|"รายเดือน" =>
  tab === "weekly" ? "รายสัปดาห์" : tab === "monthly" ? "รายเดือน" : "รายวัน";

const getRangeForTab = (tab: Tab) => {
  const now = new Date();
  let start = new Date(), end = new Date();
  if (tab === "daily") {
    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);
  } else if (tab === "weekly") {
    const offset = now.getDay() === 0 ? -6 : 1 - now.getDay(); // จันทร์เริ่มสัปดาห์
    start = new Date(now); start.setDate(now.getDate() + offset); start.setHours(0,0,0,0);
    end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0,0,0,0);
    end   = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59,999);
  }
  return { start, end };
};

export function useDiarySummary() {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [detectedEmotions, setDetectedEmotions] = useState<string[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState("");

  const summarize = async (tab: Tab) => {
    try {
      setIsLoading(true);
      setSummaryText("");
      setDetectedEmotions([]);
      setCurrentEmotion("");

      const { start, end } = getRangeForTab(tab);
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await CreateDiarySummary({
        TherapyCaseID: 1,
        Timeframe: tabToLabelTH(tab),
        StartDate: start.toISOString(),
        EndDate: end.toISOString(),
        Timezone: tz,
      });

      const sumText = res?.data?.summary?.SummaryText as string | undefined;
      const kw = res?.data?.summary?.Keyword as string | undefined;
      setSummaryText(sumText || "");

      if (kw) {
        const allow = new Set(TAGS.map(norm));
        const tokens = kw.split(/[，,]/).map(s => s.trim()).filter(Boolean)
          .filter(t => allow.has(norm(t)));
        setDetectedEmotions(tokens);
        setCurrentEmotion(tokens[0] ?? "");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, summaryText, detectedEmotions, currentEmotion, summarize };
}
