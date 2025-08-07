// components/ColorPickerTooltip.tsx
import React, { useEffect, useRef, useState } from "react";
import "./ColorPickerTooltip.css";

interface ColorPickerTooltipProps {
  colorOptions: string[];
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  onReset?: () => void; // 👈 เพิ่มตรงนี้
}

const ColorPickerTooltip: React.FC<ColorPickerTooltipProps> = ({
  colorOptions,
  selectedColors,
  onChange,
  onReset,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onChange(selectedColors.filter((c) => c !== color));
    } else {
      if (selectedColors.length >= 3) {
        return;
      }
      onChange([...selectedColors, color]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="color-picker-container" ref={pickerRef}>
      {/* Preview */}
      <div className="preview-wrapper">
        {selectedColors.map((color, index) => (
          <div
            key={index}
            className="color-preview"
            style={{ backgroundColor: color }}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          title="Edit Tag Colors"
          className="color-picker-toggle-btn"
        >
          🎨
        </button>
      </div>

      {showPicker && (
        <section className="color-picker-popup-container">
          <div className="color-picker-popup">
            {colorOptions.map((color) => (
              <div
                key={color}
                className={`color-circle ${
                  selectedColors.includes(color) ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => toggleColor(color)}
              />
            ))}
          </div>
          <div className="color-picker-actions">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="reset-colors-btn"
              >
                คืนค่าสีเดิม
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange([])}
              className="clear-colors-btn"
            >
              ล้างสี
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ColorPickerTooltip;
