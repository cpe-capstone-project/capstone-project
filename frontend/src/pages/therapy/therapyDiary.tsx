import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { GetDiariesByTherapyCaseID } from "../../services/https/TherapyCase";
import { CreateFeedback, GetFeedbackTime } from "../../services/https/Feedback";
import type { DiaryInterface } from "../../interfaces/IDiary";
import type { FeedbackTimeInterface } from "../../interfaces/IFeedbackTime";
import { ArrowLeft, FileText, Calendar, BookOpen, X, Send } from "lucide-react";

export default function DiaryList() {
  const { id } = useParams<{ id: string }>();
  const myID = localStorage.getItem("id");
  const navigate = useNavigate();

  const [diaries, setDiaries] = useState<DiaryInterface[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [showDiaryFeedbackModal, setShowDiaryFeedbackModal] = useState(false);
  const [showBatchFeedbackModal, setShowBatchFeedbackModal] = useState(false);

  const [selectedDiaryID, setSelectedDiaryID] = useState<number | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    FeedbackTitle: "",
    FeedbackContent: "",
  });

  const [feedbackTimes, setFeedbackTimes] = useState<FeedbackTimeInterface[]>([]);
  const [selectedFeedbackTimeID, setSelectedFeedbackTimeID] = useState<number | null>(null);

  const [filteredDiaries, setFilteredDiaries] = useState<DiaryInterface[]>([]);
  const [selectedDiaryIDs, setSelectedDiaryIDs] = useState<number[]>([]);

  // โหลด Feedback Time
  useEffect(() => {
    GetFeedbackTime().then((res) => {
      setFeedbackTimes(res);
      if (res.length > 0 && res[0].ID !== undefined) {
        setSelectedFeedbackTimeID(res[0].ID);
      } else {
        setSelectedFeedbackTimeID(null);
      }
    });
  }, []);

  // โหลด Diary ของเคส
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    GetDiariesByTherapyCaseID(Number(id))
      .then((res) => {
        if (res?.diaries) setDiaries(res.diaries);
      })
      .catch((err) => console.error("Error fetching diaries:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // กรอง Diary ตาม batchPeriod และ selectedFeedbackTimeID
  useEffect(() => {
    const now = new Date();
    const filtered = diaries.filter((d) => {
      if (!d.CreatedAt) return false;
      const diaryDate = new Date(d.CreatedAt);
      if (!selectedFeedbackTimeID) return true; // ถ้าไม่มีเลือก feedbackTime แสดงทั้งหมด

      switch (selectedFeedbackTimeID) {
        case 2: // Daily Summary
          return (now.getTime() - diaryDate.getTime()) <= 24 * 60 * 60 * 1000; // 1 วัน
        case 3: // Weekly Summary
          return (now.getTime() - diaryDate.getTime()) <= 7 * 24 * 60 * 60 * 1000; // 7 วัน
        case 4: // Monthly Summary
          return diaryDate.getMonth() === now.getMonth() && diaryDate.getFullYear() === now.getFullYear();
        default: // Diary Summary
          return true;
      }
    });

    setFilteredDiaries(filtered);
  }, [diaries, selectedFeedbackTimeID]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleOpenDiaryFeedback = (diaryID: number) => {
    setSelectedDiaryID(diaryID);
    setShowDiaryFeedbackModal(true);
  };

  const handleSubmitDiaryFeedback = async () => {
    if (!selectedDiaryID) return;
    try {
      const payload = {
        FeedbackTitle: feedbackForm.FeedbackTitle,
        FeedbackContent: feedbackForm.FeedbackContent,
        PsychologistID: Number(myID),
        PatientID: Number(id),
        FeedbackTypeID: 1,
        FeedbackTimeID: selectedFeedbackTimeID ?? undefined,
        DiaryIDs: [selectedDiaryID],
      };
      await CreateFeedback(payload);
      alert("ส่ง Feedback ต่อ Diary สำเร็จ");
      setShowDiaryFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedDiaryID(null);
    } catch (error) {
      console.error(error);
      alert("ส่ง Feedback ไม่สำเร็จ");
    }
  };

  const handleSubmitBatchFeedback = async () => {
    if (selectedDiaryIDs.length === 0) return;
    try {
      const payload = {
        FeedbackTitle: feedbackForm.FeedbackTitle,
        FeedbackContent: feedbackForm.FeedbackContent,
        PsychologistID: Number(myID),
        PatientID: Number(id),
        FeedbackTypeID: 1,
        FeedbackTimeID: selectedFeedbackTimeID ?? undefined,
        DiaryIDs: selectedDiaryIDs,
      };
      await CreateFeedback(payload);
      alert("ส่ง Batch Feedback สำเร็จ");
      setShowBatchFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedDiaryIDs([]);
    } catch (error) {
      console.error(error);
      alert("ส่ง Batch Feedback ไม่สำเร็จ");
    }
  };

  if (loading) return <div className="!min-h-screen !bg-white !p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="!min-h-screen !bg-white !p-8">
      <div className="!max-w-4xl !mx-auto">
        <div className="!mb-8">
          <button onClick={() => navigate(-1)} className="!inline-flex !items-center !mb-6 !text-gray-600 hover:!text-gray-900">
            <ArrowLeft className="!h-5 !w-5 !mr-2" /> กลับ
          </button>
          <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2 !flex !items-center !justify-center">
            <BookOpen className="!h-10 !w-10 !mr-3 !text-blue-600" />
            Diary ทั้งหมด
          </h1>
          <p className="!text-gray-600 !text-lg">บันทึกความคิดและความรู้สึกของผู้ป่วย</p>

          {/* ปุ่ม Batch Feedback */}
          <div className="!mt-4 !flex !justify-center">
            <button
              onClick={() => setShowBatchFeedbackModal(true)}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-6 !py-2 !rounded-lg"
            >
              ส่ง Feedback แบบต่อช่วงเวลา
            </button>
          </div>
        </div>

        {/* Diary List */}
        {diaries.length === 0 ? (
          <div className="!bg-white !border !border-gray-200 !rounded-lg !p-12 !text-center">
            <FileText className="!h-16 !w-16 !text-gray-300 !mx-auto !mb-4" />
            <h3 className="!text-xl !font-medium !text-gray-900 !mb-2">ยังไม่มี Diary</h3>
            <p className="!text-gray-500">ไม่พบบันทึก Diary สำหรับเคสนี้</p>
          </div>
        ) : (
          <div className="!space-y-6">
            {diaries.map((diary, index) => (
              <div key={diary.ID} className="!bg-white !border !border-gray-200 !rounded-lg !p-6 !shadow-sm !hover:!shadow-md !transition-shadow">
                <div className="!flex !items-start !justify-between !mb-2">
                  <div className="!flex !items-center">
                    <div className="!bg-blue-100 !p-2 !rounded-lg !mr-3">
                      <FileText className="!h-5 !w-5 !text-blue-600" />
                    </div>
                    <div>
                      <h3 className="!text-lg !font-semibold !text-gray-900">{diary.Title || `Diary รายการที่ ${index + 1}`}</h3>
                      <div className="!flex !items-center !text-sm !text-gray-500 !mt-1">
                        <Calendar className="!h-4 !w-4 !mr-1" />
                        {diary.CreatedAt ? formatDate(diary.CreatedAt) : "ไม่ระบุวันที่"}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleOpenDiaryFeedback(diary.ID!)} className="!bg-green-600 hover:!bg-green-700 !text-white !px-3 !py-1 !rounded-lg !inline-flex !items-center">
                    <Send className="!h-4 !w-4 !mr-1" /> ส่ง Feedback
                  </button>
                </div>
                <p className="!text-gray-700 !line-clamp-2">{diary.Content?.replace(/<[^>]+>/g, '') || "ไม่มีเนื้อหา"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Diary Feedback Modal */}
        {showDiaryFeedbackModal && (
          <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50">
            <div className="!bg-white !rounded-lg !w-3/4 !max-w-md !p-6 !relative">
              <button className="!absolute !top-4 !right-4 !text-gray-500 hover:!text-gray-900" onClick={() => setShowDiaryFeedbackModal(false)}>
                <X className="!h-6 !w-6" />
              </button>
              <h2 className="!text-xl !font-bold !mb-4">ส่ง Feedback ต่อ Diary</h2>
              <input
                type="text"
                placeholder="หัวข้อ Feedback"
                value={feedbackForm.FeedbackTitle}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                className="!w-full !border !border-gray-300 !rounded-lg !p-2 !mb-4"
              />
              <textarea
                placeholder="เนื้อหา Feedback"
                value={feedbackForm.FeedbackContent}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                className="!w-full !border !border-gray-300 !rounded-lg !p-2 !h-32 !mb-4"
              />
              <button onClick={handleSubmitDiaryFeedback} className="!bg-green-600 hover:!bg-green-700 !text-white !px-4 !py-2 !rounded-lg w-full">
                ส่ง Feedback
              </button>
            </div>
          </div>
        )}

        {/* Batch Feedback Modal */}
        {showBatchFeedbackModal && (
          <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50">
            <div className="!bg-white !rounded-lg !w-3/4 !max-w-lg !p-6 !relative">
              <button className="!absolute !top-4 !right-4 !text-gray-500 hover:!text-gray-900" onClick={() => setShowBatchFeedbackModal(false)}>
                <X className="!h-6 !w-6" />
              </button>
              <h2 className="!text-xl !font-bold !mb-4">ส่ง Feedback แบบต่อช่วงเวลา</h2>

              {feedbackTimes
                .filter(ft => ft.ID && ft.ID >= 2 && ft.ID <= 4)
                .map(ft => (
                  <button
                    key={ft.ID}
                    className={`!px-3 !py-1 !rounded-lg ${selectedFeedbackTimeID === ft.ID ? "!bg-blue-600 !text-white" : "!bg-gray-200 !text-gray-800"}`}
                    onClick={() => setSelectedFeedbackTimeID(ft.ID!)}
                  >
                    {ft.FeedbackTimeName}
                  </button>
                ))}

              {/* เลือก Diary */}
              <div className="!max-h-64 !overflow-y-auto !mb-4 !border !border-gray-300 !p-2 !rounded-lg !mt-5">
                {filteredDiaries.map(d => (
                  <div key={d.ID} className="!flex !items-center !mb-2">
                    <input
                      type="checkbox"
                      checked={selectedDiaryIDs.includes(d.ID!)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDiaryIDs([...selectedDiaryIDs, d.ID!]);
                        else setSelectedDiaryIDs(selectedDiaryIDs.filter(id => id !== d.ID));
                      }}
                      className="!mr-2"
                    />
                    <span>{d.Title || d.Content?.substring(0, 30) || `Diary ${d.ID}`}</span>
                  </div>
                ))}
              </div>

              <input
                type="text"
                placeholder="หัวข้อ Feedback"
                value={feedbackForm.FeedbackTitle}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                className="!w-full !border !border-gray-300 !rounded-lg !p-2 !mb-4"
              />

              <textarea
                placeholder="เนื้อหา Feedback"
                value={feedbackForm.FeedbackContent}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                className="!w-full !border !border-gray-300 !rounded-lg !p-2 !h-32 !mb-4"
              />

              <button onClick={handleSubmitBatchFeedback} className="!bg-green-600 hover:!bg-green-700 !text-white !px-4 !py-2 !rounded-lg w-full">
                ส่ง Feedback
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
