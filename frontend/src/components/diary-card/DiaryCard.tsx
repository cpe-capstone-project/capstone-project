import React, { useState } from "react";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { useDate } from "../../contexts/DateContext";
import { useDiary } from "../../contexts/DiaryContext";
// import { AiFillEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router";
import EditDiaryModal from "../edit-diary-modal/EditDiaryModal";

import { Flex } from "antd";
import "./DiaryCard.css";
import EmotionDisplay from "../emotion-display/EmotionDisplay";

interface DiaryCardProps {
  diary: DiaryInterface;
  sortField: "UpdatedAt" | "CreatedAt";
}

const DiaryCard: React.FC<DiaryCardProps> = ({ diary, sortField }) => {
  const { formatShort } = useDate();
  const { deleteDiary } = useDiary();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  // const tagColors =
  //   diary.TagColors?.split(",").map((color) =>
  //     color.trim().replace(/^"|"$/g, "")
  //   ) ?? [];
  const tagColors = [diary.TagColor1, diary.TagColor2, diary.TagColor3].filter(
    Boolean
  ); // ตัด null/undefined ออก

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <>
      <div
        className="diary-card"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
        onClick={() => {
          if (!showConfirm) {
            navigate(`/patient/diary/detail/${diary.ID}`);
          }
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="tag-bar">
          {tagColors.map((color, index) => (
            <div
              key={index}
              className="tag-segment"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="card-content">
          <div className="card-content-info">
            <div
              className="card-header-with-menu"
              style={{ position: "relative" }}
            >
              <div className="card-header">
                <h2 className="card-title">{diary.Title || "Untitled"}</h2>
                <span className="card-date">
                  {formatShort(
                    sortField === "UpdatedAt"
                      ? diary.UpdatedAt ?? ""
                      : diary.CreatedAt ?? ""
                  )}
                </span>
              </div>
            </div>

            <p className="card-text">{stripHtml(diary.Content || "")}</p>
          </div>
          <Flex align="flex-start" style={{ marginTop: "8px" }}>
            <EmotionDisplay
              emotionAnalysisResults={diary.EmotionAnalysisResults || []}
              maxDisplay={3} // จำนวนอารมณ์สูงสุดที่จะแสดง (optional, default = 3)
              diary={diary}
            />
          </Flex>

          {menuOpen && !diary.Confirmed && (
            <div className="options-menu">
              {/* <button
                className="options-menu-item edit"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowEdit(true);
                }}
              >
                <AiFillEdit />
              </button> */}

              <button
                className="options-menu-item delete"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowConfirm(true);
                }}
              >
                <FaTrash />
              </button>
            </div>
            //  </section>
          )}
        </div>
        {showConfirm && (
          <div className="confirm-overlay">
            <div
              className="confirm-modal"
              onClick={() => setShowConfirm(false)} // ป้องกันปิด modal ถ้าคลิกในกล่อง
            >
              <h3>ยืนยันการลบ</h3>
              <p>คุณแน่ใจหรือไม่ว่าต้องการลบไดอารี่นี้?</p>
              <div className="confirm-buttons">
                <button
                  className="btn cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  className="btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDiary(diary.ID || 0);
                    setShowConfirm(false);
                  }}
                >
                  ลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showEdit && (
        <EditDiaryModal
          diary={diary}
          onCancel={() => setShowEdit(false)}
          onSave={() => setShowEdit(false)}
        />
      )}
    </>
  );
};

export default DiaryCard;
