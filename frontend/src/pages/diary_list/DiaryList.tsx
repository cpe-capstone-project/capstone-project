import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
// import { useDate } from "../../contexts/DateContext";
import { th } from "date-fns/locale";
import { groupByDate } from "../../utils/GroupByDate";
import { Select, Tooltip } from "antd";
import { FaPlus } from "react-icons/fa6";
import { LuCircleAlert } from 'react-icons/lu';
import { usePath } from "../../contexts/PathContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
// import CoverBook from "../../assets/book cover/cover1.jpg";
import ToggleSwitch from "../../components/togle-switch/ToggleSwitch";
import DiaryCalendar from "../../components/diary-calendar/DiaryCalendar";
import DiaryCard from "../../components/diary-card/DiaryCard";
import { useTherapyCase } from "../../contexts/TherapyCaseContext";
import NoData from "../../assets/no data.jpg"
import "./DiaryList.css";

function DiaryList() {
  const patientId = Number(localStorage.getItem("id"));
  // ดึงข้อมูล diaries จาก context
  const { diaries, fetchDiariesByPatientAndTherapyCase } = useDiary();
  const { getTherapyCaseByPatient } = useTherapyCase();
  // ดึงฟังก์ชัน formatLong จาก context สำหรับแสดงวันที่
  // const { formatLong } = useDate();
  // ดึง path และฟังก์ชันจัดการ path
  const { fullPath } = usePath();

  const { createDiary } = useDiary();

  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"list" | "date">(
    () => (localStorage.getItem("diary_viewMode") as "list" | "date") || "list"
  );

  const [sortField, setSortField] = useState<"UpdatedAt" | "CreatedAt">(
    () =>
      (localStorage.getItem("diary_sortField") as "UpdatedAt" | "CreatedAt") ||
      "UpdatedAt"
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    () => (localStorage.getItem("diary_sortOrder") as "asc" | "desc") || "desc"
  );

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewMode(e.target.checked ? "date" : "list");
  };

  // เรียกใช้ฟังก์ชันจัดกลุ่ม diary
  const grouped = groupByDate(diaries, sortField, th);

  const handleCreateDiary = async () => {
    const therapyCases = await getTherapyCaseByPatient(patientId);
    if (!therapyCases || typeof therapyCases.ID === "undefined") {
      return;
    }

    const newDiary: DiaryInterface = {
      Title: "New Diary",
      Content: '<p style="text-align: left;"></p>',
      TherapyCaseID: therapyCases.ID,
    };
    const res = await createDiary(newDiary);
    if (res) {
      navigate(`${fullPath}/detail/${res.ID}`);
    }
  };

  useEffect(() => {
    localStorage.setItem("diary_viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("diary_sortOrder", sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    localStorage.setItem("diary_sortField", sortField);
  }, [sortField]);

  useEffect(() => {
    const fetchData = async () => {
      // ดึง therapy cases ของ patient
      const therapyCases = await getTherapyCaseByPatient(patientId);

      if (therapyCases && typeof therapyCases.ID !== "undefined") {
        const therapyCaseId = therapyCases.ID;
        fetchDiariesByPatientAndTherapyCase(
          patientId,
          therapyCaseId,
          sortField,
          sortOrder
        );
      }
    };

    fetchData();
  }, [sortField, sortOrder]);

return (
  <section className="diary-list-container">
    <div className="diary-list-header">
      <strong style={{ fontSize: "var(--font-size-2xl)" }}>My Diary</strong>

      <div className="diary-list-menu">
        {/* กรองข้อมูล */}
        <Select
          value={sortField}
          style={{ width: 120, marginRight: 8 }}
          onChange={(value) => setSortField(value)}
          options={[
            { value: "UpdatedAt", label: "วันที่แก้ไข" },
            { value: "CreatedAt", label: "วันที่สร้าง" },
          ]}
        />
        <Select
          value={sortOrder}
          style={{ width: 100 }}
          onChange={(value) => setSortOrder(value)}
          options={[
            { value: "desc", label: "ล่าสุด" },
            { value: "asc", label: "เก่าสุด" },
          ]}
        />

        {/* Switch สลับ Mode การแสดงผล */}
        <ToggleSwitch
          checked={viewMode === "date"}
          onChange={handleToggle}
          dataOn="วันที่"
          dataOff="รายการ"
        />

        <button
          className="diary-list-create-btn"
          style={{ borderRadius: "var(--radius-full)" }}
          onClick={handleCreateDiary}
        >
          <FaPlus />
          <p>สร้างไดอารี่</p>
        </button>
      </div>
    </div>

    {diaries.length === 0 ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* ใส่กราฟ placeholder หรือ component กราฟของคุณ */}
        <div className="no-data-image">
          <img src={NoData} alt="" />
          <p>ยังไม่มีไดอารี่</p>
        </div>

        {/* <button
          className="diary-list-create-btn"
          onClick={handleCreateDiary}
          style={{ borderRadius: "var(--radius-full)" }}
        >
          <FaPlus /> สร้างไดอารี่ใหม่
        </button> */}
      </div>
    ) : viewMode === "list" ? (
      // แสดงเฉพาะเมื่อ viewMode เป็น list
      <>
        {Object.entries(grouped).map(([label, items]) => (
          <div
            key={label}
            className="diary-list"
            style={{ marginBottom: "var(--space-2xl)" }}
          >
            <h1>{label}</h1>
            <div className="diary-grid">
              {items.map((item) => (
                <div key={item.ID} className="diary-item">
                  {!item.Confirmed && (
                    <Tooltip title="ยังไม่บันทึก">
                      <div className="unconfirmed-badge"><LuCircleAlert/></div>
                    </Tooltip>
                  )}
                  <DiaryCard diary={item} sortField={sortField} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    ) : (
      <DiaryCalendar diaries={diaries} dateField={sortField} />
    )}
  </section>
);

}

export default DiaryList;
