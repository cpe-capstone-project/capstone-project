import React from "react";
import type { CalendarProps } from "antd";
import { Badge, Calendar } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
dayjs.locale("th");
import type { DiaryInterface } from "../../interfaces/IDiary";
import { useNavigate, useLocation } from "react-router";

interface DiaryCalendarProps {
  diaries: DiaryInterface[];
  dateField?: "UpdatedAt" | "CreatedAt";
}

const DiaryCalendar: React.FC<DiaryCalendarProps> = ({
  diaries,
  dateField = "UpdatedAt",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // สร้าง map วันที่ -> diary[]
  const diaryMap = React.useMemo(() => {
    const map: Record<string, DiaryInterface[]> = {};
    diaries.forEach((diary) => {
      const dateStr = diary[dateField] || diary.CreatedAt;
      if (dateStr) {
        const date = dayjs(dateStr).format("YYYY-MM-DD");
        if (!map[date]) map[date] = [];
        map[date].push(diary);
      }
    });
    return map;
  }, [diaries, dateField]);

  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const listData = diaryMap[dateKey] || [];
    if (listData.length === 0) return null;

    return (
      <div className="ant-picker-calendar-date-content">
        {listData.map((diary) => (
          <div
            key={diary.ID}
            style={{ cursor: "pointer", marginBottom: 4 }}
            onClick={() => navigate(`${location.pathname}/detail/${diary.ID}`)}
            title={diary.Title || "No Title"}
          >
            <Badge status="success" text={diary.Title || "No Title"} />
          </div>
        ))}
      </div>
    );
  };
  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  return <Calendar cellRender={cellRender} />;
};

export default DiaryCalendar;
