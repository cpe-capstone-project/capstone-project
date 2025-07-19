import { useState } from "react";
import "./checkList.css";

function CheckList() {
  const [checked, setChecked] = useState({
    diary: false,
    thoughtRecord: false,
    dailySummary: false,
    cbtConfirm: false,
  });

  const toggleCheck = (key: keyof typeof checked) => {
    setChecked({ ...checked, [key]: !checked[key] });
  };

  return (
    <div className="checklist-container">
      <h2 className="checklist-title">CHECKLIST</h2>

      <div className="checklist-item" onClick={() => toggleCheck("diary")}>
        <span className={`check-icon ${checked.diary ? "checked" : ""}`}>
          {checked.diary ? "✔️" : "⭕"}
        </span>
        จดบันทึกไดอารี่
      </div>

      <div className="checklist-item" onClick={() => toggleCheck("thoughtRecord")}>
        <span className={`check-icon ${checked.thoughtRecord ? "checked" : ""}`}>
          {checked.thoughtRecord ? "✔️" : "⭕"}
        </span>
        ทำแบบประเมิน Though Record
      </div>

      <div className="checklist-item" onClick={() => toggleCheck("dailySummary")}>
        <span className={`check-icon ${checked.dailySummary ? "checked" : ""}`}>
          {checked.dailySummary ? "✔️" : "⭕"}
        </span>
        ติดตามผลสรุปรายวัน
      </div>

      <div className="checklist-item" onClick={() => toggleCheck("cbtConfirm")}>
        <span className={`check-icon ${checked.cbtConfirm ? "checked" : ""}`}>
          {checked.cbtConfirm ? "✔️" : "⭕"}
        </span>
        ยืนยันการทำแบบฝึกหัด CBT
      </div>
    </div>
  );
}

export default CheckList;
