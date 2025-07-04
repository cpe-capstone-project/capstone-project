import React from "react";
import "./ToggleSwitch.css"

interface ToggleSwitchContainerProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dataOn?: string;
  dataOff?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchContainerProps> = ({
  checked,
  onChange,
  dataOn = "วันที่",
  dataOff = "รายการ",
}) => (
  <div className="toggle-switch-container">
    <label className="toggle-switch toggle-switch-wrapper">
      <input
        type="checkbox"
        name="view_mode"
        id="view_mode"
        value="1"
        checked={checked}
        onChange={onChange}
      />
      <label
        htmlFor="view_mode"
        data-on={dataOn}
        data-off={dataOff}
        className="toggle-switch-inner"
      ></label>
    </label>
  </div>
);

export default ToggleSwitch;