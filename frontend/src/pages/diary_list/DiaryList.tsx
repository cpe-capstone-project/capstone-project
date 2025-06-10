import { Link } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import { useDate } from "../../contexts/DateContext";
import { th } from "date-fns/locale";
import { groupByDate } from "../../utils/GroupByDate";
import "./DiaryList.css";

function DiaryList() {
  // ดึงข้อมูล diaries จาก context
  const { diaries } = useDiary();
  // ดึงฟังก์ชัน formatLong จาก context สำหรับแสดงวันที่
  const { formatLong } = useDate();

  // เรียกใช้ฟังก์ชันจัดกลุ่ม diary
  const grouped = groupByDate(diaries, "UpdatedAt", th);

  return (
    <section className="diary-list-container">
      <h1>My Diary</h1>
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

export default DiaryList;
