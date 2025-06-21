import React, { useState } from "react";
import { useNavigate} from "react-router";
import { Link } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import { useDate } from "../../contexts/DateContext";
import { th } from "date-fns/locale";
import { groupByDate } from "../../utils/GroupByDate";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { RiSortDesc, RiCheckFill } from "react-icons/ri";
import { FaPlus } from "react-icons/fa6";
import { usePath } from "../../contexts/PathContext";
import "./DiaryList.css";
import type { DiaryInterface } from "../../interfaces/IDiary";

function DiaryList() {
  // ดึงข้อมูล diaries จาก context
  const { diaries } = useDiary();
  // ดึงฟังก์ชัน formatLong จาก context สำหรับแสดงวันที่
  const { formatLong } = useDate();
 // ดึง path และฟังก์ชันจัดการ path
  const { fullPath } = usePath();
  console.log("fullPath", fullPath);

  const { createDiary } = useDiary();

  const navigate = useNavigate();

  // const [isloading, setIsLoading] = useState(false);

  const [sortField, setSortField] = useState<"UpdatedAt" | "CreatedAt">(
    "UpdatedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const items: MenuProps["items"] = [
    {
      key: "updated",
      label: (
        <SortMenuItem
          label="วันที่แก้ไข"
          active={sortField === "UpdatedAt"}
          onClick={() => setSortField("UpdatedAt")}
        />
      ),
    },
    {
      key: "created",
      label: (
        <SortMenuItem
          label="วันที่สร้าง"
          active={sortField === "CreatedAt"}
          onClick={() => setSortField("CreatedAt")}
        />
      ),
    },
    { key: "divider-1", type: "divider" },
    {
      key: "desc",
      label: (
        <SortMenuItem
          label="ล่าสุด"
          active={sortOrder === "desc"}
          onClick={() => setSortOrder("desc")}
        />
      ),
    },
    {
      key: "asc",
      label: (
        <SortMenuItem
          label="เก่าสุด"
          active={sortOrder === "asc"}
          onClick={() => setSortOrder("asc")}
        />
      ),
    },
  ];

  return (
    <section className="diary-list-container">
      <div className="diary-list-header">
        <h1>My Diary</h1>
        <Dropdown
          menu={{ items }}
          placement="bottomRight"
          trigger={["click"]}
          className="sort-container"
          overlayStyle={{ borderRadius: "50px" }}
        >
          <RiSortDesc
            className="options-icon"
            title="Sort Options"
            style={{ cursor: "pointer" }}
          />
        </Dropdown>
        <button className="diary-list-create-btn" onClick={handleCreateDiary}>
          <FaPlus /> 
          <p>สร้างไดอารี่</p>
        </button>
      </div>
      {/* วนลูปแสดงกลุ่ม diary */}
      {Object.entries(grouped).map(([label, items]) => (
        <div key={label}>
          <h2>{label}</h2>
          <div className="diary-list">
            {/* แสดง diary ภายในกลุ่มนี้ */}
            {items.map((item) => (
              <Link
                key={item.ID}
                to={`${location.pathname}/detail/${item.ID}`}
                style={{
                  textDecoration: "none",
                  color: "black",
                  width: "auto",
                  height: "100%",
                }}
              >
                <div className="diary">
                  {/* รูปภาพตัวอย่าง */}
                  <img
                    src="https://png.pngtree.com/background/20210709/original/pngtree-memphis-yellow-poster-geometric-picture-image_941965.jpg"
                    alt="Diary"
                  />
                  <div className="diary-info">
                    <h1>{item.Title}</h1>
                    {/* แสดงวันที่แบบยาวที่ formatLong ช่วยแปลง */}
                    <p>{formatLong(item.UpdatedAt ?? "", "th")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

const SortMenuItem = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <div onClick={onClick}>
    <div className="menu-item">
      {active ? (
        <RiCheckFill className="check-icon" />
      ) : (
        <span className="check-icon-placeholder" />
      )}
      {label}
    </div>
  </div>
);

export default DiaryList;
