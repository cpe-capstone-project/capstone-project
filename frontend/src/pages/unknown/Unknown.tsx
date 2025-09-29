import { useNavigate } from "react-router";
import { Button, Result } from "antd";
import "./Unknown.css";

function Unknown() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // กลับไปยังหน้าก่อนหน้า
  };

  return (
    <div className="unknown-container">
      <Result
        status="404"
        title="404 - ไม่พบหน้านี้"
        subTitle="ขออภัย หน้าที่คุณพยายามเข้าถึงไม่มีอยู่จริงหรืออาจถูกย้ายไปแล้ว กรุณากลับไปยังหน้าก่อนหน้า"
        extra={
          <Button type="primary" onClick={handleBack}>
            กลับไปหน้าก่อนหน้า
          </Button>
        }
      />
    </div>
  );
}

export default Unknown;
