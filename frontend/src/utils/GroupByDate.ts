import { parseISO, isToday, isYesterday, isThisWeek, isThisMonth, format } from "date-fns";
import type { Locale } from "date-fns";

export function groupByDate<T>(
  items: T[],
  dateField: keyof T = "UpdatedAt" as keyof T,
  locale?: Locale
): Record<string, T[]> {
  
  const getLabel = (date: Date) => {
    if (isToday(date)) return locale?.code === "th" ? "วันนี้" : "Today";
    if (isYesterday(date)) return locale?.code === "th" ? "เมื่อวานนี้" : "Yesterday";
    if (isThisWeek(date)) return locale?.code === "th" ? "สัปดาห์นี้" : "This Week";
    if (isThisMonth(date)) return locale?.code === "th" ? "เดือนนี้" : "This Month";
    return format(date, "MMMM yyyy", { locale });
  };

  return items.reduce((groups, item) => {
    const raw = item[dateField];
    if (typeof raw !== "string") return groups;

    const date = parseISO(raw);
    const label = getLabel(date);

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
