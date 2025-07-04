import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import { useDate } from "../../contexts/DateContext";
import { th } from "date-fns/locale";
import { groupByDate } from "../../utils/GroupByDate";
import { Button, Select } from "antd";
import { FaPlus } from "react-icons/fa6";
import { usePath } from "../../contexts/PathContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
import CoverBook from "../../assets/book cover/cover1.jpg";
import "./DiaryList.css";
import ToggleSwitch from "../../components/togle-switch/ToggleSwitch";
import DiaryCalendar from "../../components/diary-calendar/DiaryCalendar";

function DiaryList() {
  // ดึงข้อมูล diaries จาก context
  const { diaries, fetchDiaries } = useDiary();
  // ดึงฟังก์ชัน formatLong จาก context สำหรับแสดงวันที่
  const { formatLong } = useDate();
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
    const newDiary: DiaryInterface = {
      Title: "New Diary",
      Content: '<p style="text-align: left;"></p>',
      TherapyCaseID: 1,
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
    fetchDiaries(sortField, sortOrder);
  }, [sortField, sortOrder]);

  return (
    <section className="diary-list-container">
      <div className="diary-list-header">
        <h1 style={{ fontSize: "var(--font-size-2xl)" }}>My Diary</h1>

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

          <Button
            type="primary"
            style={{ borderRadius: "var(--radius-full)" }}
            onClick={handleCreateDiary}
          >
            <FaPlus />
            สร้างไดอารี่
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        // แสดงเฉพาะเมื่อ viewMode เป็น list
        <>
          {Object.entries(grouped).map(([label, items]) => (
            <div
              key={label}
              className="diary-list"
              style={{ marginBottom: "var(--space-2xl)" }}
            >
              <h2>{label}</h2>
              <div className="diary-grid">
                {items.map((item) => (
                  <Link
                    key={item.ID}
                    to={`${location.pathname}/detail/${item.ID}`}
                    className="diary-item"
                  >
                    <div className="diary">
                      <img src={CoverBook} alt="Diary" />
                      <div className="diary-info">
                        <h1>{item.Title}</h1>
                        <p>{formatLong(item.UpdatedAt ?? "", "th")}</p>
                      </div>
                    </div>
                  </Link>
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
