import React from "react";
import type { ToolbarProps } from "react-big-calendar";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type Props = ToolbarProps & {
  date: Date;
  setDate: (date: Date) => void;
};

const CustomToolbar: React.FC<Props> = ({ date, setDate }) => {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();

  const handlePrev = () => {
    if (monthIndex === 0) {
      setDate(new Date(year - 1, 11, 1)); // ถอยเดือนสุดท้ายของปีก่อน
    } else {
      setDate(new Date(year, monthIndex - 1, 1));
    }
  };

  const handleNext = () => {
    if (monthIndex === 11) {
      setDate(new Date(year + 1, 0, 1)); // ไปเดือนแรกของปีถัดไป
    } else {
      setDate(new Date(year, monthIndex + 1, 1));
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontWeight: "bold",
        fontSize: "20px",
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <span style={{ width: "20%", textAlign: "left" }}>{year}</span>
      <span>
        <button onClick={handlePrev} style={{ marginRight: "8px" }}>◀</button>
        {months[monthIndex]}
        <button onClick={handleNext} style={{ marginLeft: "8px" }}>▶</button>
      </span>
      <span style={{ width: "35%", textAlign: "right", fontSize: "14px", color: "#666" }}>
        Depressionrec.co.th
      </span>
    </div>
  );
};

export default CustomToolbar;
