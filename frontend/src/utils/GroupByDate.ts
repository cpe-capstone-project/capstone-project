import {
  parseISO,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  format,
  // startOfWeek,
  // endOfWeek,
} from "date-fns";
import type { Locale } from "date-fns";

/**
 * จัดกลุ่ม item ตามช่วงเวลาที่แตกต่างกัน โดยใช้ฟิลด์วันที่ที่ระบุ และ locale สำหรับการแสดงผลวันที่
 * @param items - รายการข้อมูลที่ต้องการจัดกลุ่ม
 * @param dateField - ชื่อฟิลด์วันที่ (default: "UpdatedAt")
 * @param locale - locale ของ date-fns สำหรับแสดงวันที่ (default: enUS)
 * @returns กลุ่มข้อมูลตามช่วงเวลาที่จัดกลุ่ม
**/
export function groupByDate<
  T extends Partial<Record<K, string | undefined>>,
  K extends keyof T = keyof T
>(
  items: T[],
  dateField: K = "UpdatedAt" as K,
  locale?: Locale
): { [key: string]: T[] } {
  return items.reduce((acc, item) => {
    const dateString = item[dateField];
    if (!dateString) return acc;

    const date = parseISO(dateString);
    let label = "";

    if (isToday(date)) label = locale?.code === "th" ? "วันนี้" : "Today";
    else if (isYesterday(date)) label = locale?.code === "th" ? "เมื่อวานนี้" : "Yesterday";
    else if (isThisWeek(date)) label = locale?.code === "th" ? "สัปดาห์นี้" : "This Week";
    else if (isThisMonth(date)) label = locale?.code === "th" ? "เดือนนี้" : "This Month";
    else label = format(date, "MMMM yyyy", { locale });

    if (!acc[label]) acc[label] = [];
    acc[label].push(item);

    return acc;
  }, {} as { [key: string]: T[] });
}
