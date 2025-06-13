import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { IoChevronBackOutline } from "react-icons/io5";
import { RiSortDesc, RiCheckFill, RiDeleteBin6Line  } from "react-icons/ri";

import { th } from "date-fns/locale";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";

import { usePath } from "../../contexts/PathContext";
import { useDate } from "../../contexts/DateContext";
import { useDiary } from "../../contexts/DiaryContext";
import { groupByDate } from "../../utils/GroupByDate";

import "./DiarySidebar.css";

const stripHtml = (html: string) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const DiarySidebar = () => {
  const { id } = useParams<{ id: string }>();
  const { diaries, fetchDiaries, deleteDiary } = useDiary();
  const { basePath, getBackPath } = usePath();
  const { formatShort } = useDate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [sortField, setSortField] = useState<"UpdatedAt" | "CreatedAt">(
    "UpdatedAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchDiaries(sortField, sortOrder);
  }, [sortField, sortOrder]);

  const grouped = groupByDate(diaries, sortField, th);

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

  useEffect(() => {
    if (id) {
      const el = document.getElementById(`diary-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [id, diaries]);

  return (
    <aside className="left-side">
      <section className="left-side-header" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "var(--space-md)" }}>
        <div className="control">
          <Link to={getBackPath(2)} className="back-container">
            <IoChevronBackOutline />
            <strong>Back</strong>
          </Link>

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
        </div>

        {selectedIds.length > 0 && (
          <div className={`delete-selected-container`}>
            <p>
              ลบที่เลือก ({selectedIds.length})
            </p>
            <button className="delete-selected-btn"
              onClick={async () => {
                for (const id of selectedIds) {
                  await deleteDiary(id);
                }
                setSelectedIds([]);
              }}
            >
              <RiDeleteBin6Line />
            </button>
          </div>
        )}
      </section>
      {Object.entries(grouped).map(([label, items]) => (
        <div key={label} className="diary-group">
          <h2>{label}</h2>
          {items.map((item) => (
            <div
              id={`diary-${item.ID}`}
              key={item.ID}
              className={`diary-list-item${
                  Number(id) === item.ID ? " active" : ""
                }`}
            >
              <button
                className={`circle-select-btn${
                  selectedIds.includes(item.ID) ? " selected" : ""
                }`}
                onClick={() => {
                  setSelectedIds((prev) =>
                    prev.includes(item.ID)
                      ? prev.filter((id) => id !== item.ID)
                      : [...prev, item.ID]
                  );
                }}
              />
              <Link
                // id={`diary-${item.ID}`}
                key={item.ID}
                to={`${basePath}/${item.ID}`}
                className={`left-side-diary`}
              >
                <div className="left-side-diary-info">
                  <header>
                    <h1>{item.Title}</h1>
                    <p>{formatShort(item[sortField])}</p>
                  </header>
                  <div className="content">
                    <p>{stripHtml(item.Content ?? "")}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
};

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

export default DiarySidebar;
