// =======================
// Customcalendar.tsx
// =======================
import React from "react";
import type { ToolbarProps } from "react-big-calendar";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Event type definition
export type MyEvent = {
  title: string;
  start: Date;
  end: Date;
};

// Extend ToolbarProps with date/setDate manually
type Props = ToolbarProps<MyEvent, object> & {
  date: Date;
  setDate: (date: Date) => void;
};

const Customcalendar: React.FC<Props> = ({ date, setDate }) => {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();

  const handlePrev = () => {
    setDate(
      monthIndex === 0
        ? new Date(year - 1, 11, 1)
        : new Date(year, monthIndex - 1, 1)
    );
  };

  const handleNext = () => {
    setDate(
      monthIndex === 11
        ? new Date(year + 1, 0, 1)
        : new Date(year, monthIndex + 1, 1)
    );
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

export default Customcalendar;
