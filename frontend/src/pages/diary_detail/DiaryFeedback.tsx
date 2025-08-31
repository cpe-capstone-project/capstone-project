import { useState, useEffect } from "react";
import { Empty, Flex } from "antd";
import { useParams } from "react-router-dom";
import { useDiary } from "../../contexts/DiaryContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
import "./DiaryFeedback.css";
import { useDate } from "../../contexts/DateContext";

function DiaryFeedback() {
  const { id } = useParams<{ id: string }>();
  const { getDiaryById } = useDiary();
  const { formatLong } = useDate();
  const [diary, setDiary] = useState<DiaryInterface | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getDiaryById(Number(id));
      if (data?.ID) setDiary(data);
    })();
  }, [id]);

  // if (!diary) return <p>No diary found</p>;

  // ✅ ดึง feedback จาก FeedbackDiary
  const feedbacks = diary?.FeedbackDiary?.map(fd => fd.Feedback) || [];

  if (feedbacks.length === 0)
    return (
      <div className="no-feedback">
        <Empty description={"ยังไม่มีคำแนะนำสำหรับไดอารี่ของคุณ"} />
      </div>
    );

  // ✅ จัดกลุ่ม feedback ตามนักจิตวิทยา
  const feedbacksByPsy = new Map<number, typeof feedbacks>();
  feedbacks.forEach((fb) => {
    if (!fb) return;
    const id = fb.Psychologist?.ID || fb.PsychologistID || 0;
    if (!feedbacksByPsy.has(id)) feedbacksByPsy.set(id, []);
    feedbacksByPsy.get(id)!.push(fb);
  });

  return (
    <div className="diary-feedback">
      <h1 style={{ fontSize: "var(--font-size-xl)", fontWeight:"bold" }}>คำแนะนำ</h1>
      {[...feedbacksByPsy.values()].map((fbs) => {
        const psy = fbs[0]?.Psychologist;

        return (
          <Flex
            key={psy?.ID || "unknown"}
            vertical
            gap="var(--space-md)"
            className="feedback-content"
          >
            <Flex
              vertical={false}
              gap="var(--space-xs)"
              align="center"
              className="psy-info-container"
            >
              <img
                className="psy-profile"
                src={
                  // psy?.Profile ||
                  "https://static.vecteezy.com/system/resources/previews/014/194/215/original/avatar-icon-human-a-person-s-badge-social-media-profile-symbol-the-symbol-of-a-person-vector.jpg"
                }
                alt=""
              />
              <Flex vertical className="psy-info">
                <p>นักจิตวิทยา</p>
                <h1>{psy?.FirstName} {psy?.LastName}</h1>
              </Flex>
            </Flex>

            <div className="feedback-content-list">
              {fbs.map((fb, index) => {
                const createdAt = new Date(fb?.CreatedAt);
                const dayString = createdAt.toDateString();
                const formattedTime = formatLong(fb?.CreatedAt, "th");

                // ✅ เช็คว่าจะแสดงเวลาไหม
                let showTime = true;
                if (index > 0) {
                  const prevCreatedAt = new Date(fbs[index - 1].CreatedAt);
                  if (prevCreatedAt.toDateString() === dayString) {
                    showTime = false;
                  }
                }

                return (
                  <Flex
                    vertical
                    gap="var(--space-xs)"
                    align="center"
                    key={fb?.ID}
                  >
                    {showTime && (
                      <small className="feedback-time">{formattedTime}</small>
                    )}
                    <div className="feedback-text">
                      <h1>{fb?.FeedbackTitle}</h1>
                      <p>{fb?.FeedbackContent}</p>
                      {/* {fb?.FeedbackType && (
                        <small>ประเภท: {fb.FeedbackType.FeedbackName}</small>
                      )} */}
                    </div>
                  </Flex>
                );
              })}
            </div>
          </Flex>
        );
      })}
    </div>
  );
}

export default DiaryFeedback;
