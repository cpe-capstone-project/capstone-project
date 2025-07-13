import React, { useState } from "react";
import "./EditDiaryModal.css";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { useDiary } from "../../contexts/DiaryContext";

interface EditDiaryModalProps {
  diary: DiaryInterface;
  onCancel: () => void;
  onSave?: () => void;
}

const allColors = [
  "#4CAF50",
  "#81C784",
  "#A5D6A7",
  "#9E9E9E",
  "#607D8B",
  "#546E7A",
  "#8BC34A",
  "#CDDC39",
  "#FFEB3B",
  "#2196F3",
  "#03A9F4",
  "#00BCD4",
  "#FFEB3B",
  "#FFC107",
  "#FF9800",
  "#795548",
  "#6D4C41",
  "#3E2723",
  "#03A9F4",
  "#00BCD4",
  "#009688",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#4CAF50",
  "#8BC34A",
  "#CDDC39",
  "#FFC107",
  "#FF9800",
  "#FF5722",
];
const colorOptions = Array.from(new Set(allColors));

const EditDiaryModal: React.FC<EditDiaryModalProps> = ({
  diary,
  onCancel,
  onSave,
}) => {
  const { updateDiary } = useDiary();
  const [editTitle, setEditTitle] = useState(diary.Title || "");
  const [editContent, setEditContent] = useState(diary.Content || "");
  const [editTagColors, setEditTagColors] = useState<string[]>(
    diary.TagColors?.split(",").map((c) => c.trim().replace(/^"|"$/g, "")) || []
  );

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!diary || diary.ID === undefined) return;
    e.preventDefault();

    const updatedDiary: DiaryInterface = {
      ID: diary.ID,
      Title: editTitle,
      Content: `<p>${editContent}</p>`,
      UpdatedAt: new Date().toISOString(),
      TagColors: editTagColors.join(", "),
      TherapyCaseID: diary.TherapyCaseID,
    };

    try {
      await updateDiary(diary.ID, updatedDiary);
      if (onSave) onSave();
    } catch (error) {
      console.error("Failed to update diary:", error);
      // สามารถแสดง error message ได้ตรงนี้ เช่น toast
    }
  };

  return (
    <section className="edit-overlay" onClick={onCancel}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <header>แก้ไขไดอารี่</header>
        <div className="edit-content">
          <div className="edit-preview">
            <div className="preview-diary-card">
              <div className="tag-bar">
                {editTagColors.map((color, index) => (
                  <div
                    key={index}
                    className="tag-segment"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="edit-card-content">
                <div
                  className="card-header-with-menu"
                  style={{ position: "relative" }}
                >
                  <div className="card-header">
                    <h2 className="card-title">{editTitle}</h2>
                  </div>
                </div>

                <p className="card-text">{stripHtml(editContent || "")}</p>
              </div>
            </div>
          </div>
          <form className="edit-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="ชื่อเรื่อง"
            />
            <textarea
              className="edit-textarea"
              value={stripHtml(editContent)}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="เนื้อหา"
              rows={6}
            />

            <div className="color-picker">
              <div className="color-picker-header">
                <p>เลือกสีแท็ก:</p>
                <button
                  type="button"
                  className="clear-colors-btn"
                  onClick={() => setEditTagColors([])}
                >
                  ล้างสีทั้งหมด
                </button>
              </div>
              <div className="color-options">
                {colorOptions.map((color) => (
                  <div
                    key={color}
                    className={`color-circle ${
                      editTagColors.includes(color) ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setEditTagColors((prev) =>
                        prev.includes(color)
                          ? prev.filter((c) => c !== color)
                          : [...prev, color]
                      );
                    }}
                  />
                ))}
              </div>
              <div className="tag-preview">
                {editTagColors.map((color, index) => (
                  <div
                    key={index}
                    className="tag-bar-preview"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <p style={{fontSize:"var(--font-size-xs)", opacity:"0.6"}}>ถ้ายังไม่ได้เลือกสี ระบบจะเติมสีพื้นฐานให้เองโดยอัตโนมัติ</p>

            <div className="edit-buttons">
              <button className="edit-btn cancel" onClick={onCancel}>
                ยกเลิก
              </button>
              <button type="submit" className="edit-btn save">
                บันทึก
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditDiaryModal;
