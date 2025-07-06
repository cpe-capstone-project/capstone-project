import "./PopConfirm.css";

function PopConfirm() {
  return (
    <div className="confirm-container">
      <h1 className="confirm-title">ยืนยันการลบไดอารี่ ?</h1>
      <hr/>
      <div className="confirm-content">
        <p className="confirm-info">คุณต้องการลบไดอารี่ที่เลือก ($12 รายการ) ใช่หรือไม่?</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel">ยกเลิก</button>
          <button className="confirm-btn confirm">ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

export default PopConfirm;
