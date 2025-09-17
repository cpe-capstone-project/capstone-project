// components/color-picker/ColorPickerWithPresets.tsx
import React, { useState } from "react";
import { ColorPicker, Space, Button } from "antd";
import { BgColorsOutlined } from "@ant-design/icons";
import type { ColorPickerProps } from "antd";

interface ColorPickerWithPresetsProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
}

const defaultPresets = [
  "#155fdeff", // น้ำเงิน (default)
  "#ff4d4f",   // แดง
  "#52c41a",   // เขียว
  "#faad14",   // เหลือง/ส้ม
  "#722ed1",   // ม่วง
  "#13c2c2",   // เขียวอ่อน
  "#eb2f96",   // ชมพู
  "#fa8c16",   // ส้ม
  "#2f54eb",   // น้ำเงินเข้ม
  "#389e0d",   // เขียวเข้ม
  "#d46b08",   // น้ำตาลส้ม
  "#531dab",   // ม่วงเข้ม
  "#1890ff",   // ฟ้า (AntD primary blue)
  "#f5222d",   // แดงสด
  "#7cb305",   // เขียวสด
  "#fadb14",   // เหลืองสด
  "#595959",   // เทาเข้ม (neutral)
  "#a0d911"    // เขียวมะนาว
];


function ColorPickerWithPresets({ 
  value = "#155fdeff", 
  onChange, 
  presets = defaultPresets 
}: ColorPickerWithPresetsProps) {
  const [selectedColor, setSelectedColor] = useState(value);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handlePresetClick = (color: string) => {
    setSelectedColor(color);
    onChange?.(color);
  };

  const handleCustomChange: ColorPickerProps['onChange'] = (color) => {
    const hexColor = color.toHexString();
    setSelectedColor(hexColor);
    onChange?.(hexColor);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Preset Colors */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ 
          fontSize: "13px", 
          color: "#666", 
          marginBottom: 8,
          fontWeight: 500 
        }}>
          สีที่แนะนำ:
        </div>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          gap: 8 
        }}>
          {presets.map((color, index) => (
            <button
              key={index}
              onClick={() => handlePresetClick(color)}
              style={{
                width: 32,
                height: 32,
                backgroundColor: color,
                border: selectedColor === color ? "3px solid #1677ff" : "2px solid #d9d9d9",
                borderRadius: 8,
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: selectedColor === color 
                  ? "0 0 0 2px rgba(22, 119, 255, 0.2)" 
                  : "0 1px 2px rgba(0,0,0,0.1)",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                if (selectedColor !== color) {
                  e.currentTarget.style.transform = "scale(1.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {selectedColor === color && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "bold"
                }}>
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker */}
      <div>
        <div style={{ 
          fontSize: "13px", 
          color: "#666", 
          marginBottom: 8,
          fontWeight: 500 
        }}>
          หรือเลือกสีแบบกำหนดเอง:
        </div>
        <Space>
          <ColorPicker
            value={selectedColor}
            onChange={handleCustomChange}
            showText
            size="large"
            format="hex"
            presets={[
              {
                label: 'สีธีม',
                colors: presets,
              }
            ]}
          />
          <span style={{ fontSize: "13px", color: "#999" }}>
            ({selectedColor})
          </span>
        </Space>
      </div>
    </div>
  );
}

export default ColorPickerWithPresets;