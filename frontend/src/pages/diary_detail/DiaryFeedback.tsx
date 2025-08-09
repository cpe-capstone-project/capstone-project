import { Flex } from "antd";
import { useParams } from "react-router-dom";
import "./DiaryFeedback.css";

function DiaryFeedback() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="diary-feedback">
      <h1>คำแนะนำ</h1>
      
      <Flex className="feedback-content" vertical gap="var(--space-md)">
        <Flex vertical={false} gap="var(--space-xs)" align="center">
            <img className="psy-profile" src="https://static.vecteezy.com/system/resources/previews/014/194/215/original/avatar-icon-human-a-person-s-badge-social-media-profile-symbol-the-symbol-of-a-person-vector.jpg" alt="" />
            <Flex vertical className="psy-info">
                <p>นักจิตวิทยา</p>
                <h1>นายรวิพล มุ่งดี</h1>
            </Flex>
        </Flex>
        <div className="feedback-text">
            <p>อันดับแรกคือห้ามตัดสินความทุกข์ของผู้อื่น อย่างเด็ดขาด และในขณะเดียวกันคุณก็จะ ต้องแสดงความห่วงใยให้ผู้ที่กำลังป่วยได้รับ รู้อย่างเต็มที่ เมื่อผู้ป่วยสัมผัสได้ถึงความจริงใจและความห่วงใยที่คุณมี ก็จะเป็น โอกาสดี ๆ ที่จะโน้มน้าวใจเขาให้ไปพบ จิตแพทย์ได้ง่ายมากขึ้น เพราะไม่ว่าใคร ๆ ต่างก็อยากได้ความจริงใจทั้งนั้น</p>
        </div>
      </Flex>
    </div>
  );
}

export default DiaryFeedback;