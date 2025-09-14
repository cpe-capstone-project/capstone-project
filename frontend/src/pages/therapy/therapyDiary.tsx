import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { GetDiariesByTherapyCaseID } from "../../services/https/TherapyCase";
import { CreateFeedback, GetFeedbackTime } from "../../services/https/Feedback";
import { DeleteDiaryById, } from "../../services/https/Diary";
import type { DiaryInterface } from "../../interfaces/IDiary";
import type { FeedbackTimeInterface } from "../../interfaces/IFeedbackTime";
import { Modal,message } from "antd";
import { ArrowLeft, FileText, BookOpen, X, Send, CalendarDays, MessageCircle, Clock, MessageSquare,Trash } from "lucide-react";

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

  const [showReadDiaryModal, setShowReadDiaryModal] = useState(false);
  const [readingDiary, setReadingDiary] = useState<DiaryInterface | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showModalBatch, setShowModalBatch] = useState(false);
  const [notification, setNotification] = useState<{ message: string, success: boolean } | null>(null);

  // --- ฟังก์ชันเปิด Modal อ่าน Diary ---
  const handleOpenReadDiary = (diary: DiaryInterface) => {
    setReadingDiary(diary);
    setShowReadDiaryModal(true);
  };

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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3000ms = 3 วินาที
      return () => clearTimeout(timer);
    }
  }, [notification]);

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



  const handleOpenDiaryFeedback = (diaryID: number) => {
    setSelectedDiaryID(diaryID);
    setShowDiaryFeedbackModal(true);
  };

  // ⬇️ แก้ในฟังก์ชัน handleSubmitDiaryFeedback
  const handleSubmitDiaryFeedback = async () => {
    if (!selectedDiaryID) return;
    setNotification({ message: "ส่งไม่สำเร็จ", success: false });
    try {
      const payload = {
        FeedbackTitle: feedbackForm.FeedbackTitle,
        FeedbackContent: feedbackForm.FeedbackContent,
        PsychologistID: Number(myID),
        PatientID: Number(id),
        FeedbackTypeID: 1,
        FeedbackTimeID: 1,
        DiaryIDs: [Number(selectedDiaryID)],
      };
      const res = await CreateFeedback(payload);

      // เก็บไดอารี่เป้าหมายล่าสุด (ไว้ให้ HomePage โหลดตามไอดี)
      localStorage.setItem("last_feedback_diary_id", String(selectedDiaryID));

      // ยิง event พร้อมข้อมูลสำคัญ
      const created = res?.data ?? res; // รองรับทั้ง axios.data หรือเพียวๆ
      window.dispatchEvent(
        new CustomEvent("feedback:created", {
          detail: {
            diaryIds: [selectedDiaryID],
            items: Array.isArray(created) ? created : [created],
            scope: "diary",
          },
        })
      );

      setNotification({ message: "ส่งFeedback สำเร็จ", success: true });
      setShowDiaryFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedDiaryID(null);
    } catch (error) {
      console.error(error);
      setNotification({ message: "ส่งไม่สำเร็จ", success: false });
    }
  };

  // ⬇️ แก้ในฟังก์ชัน handleSubmitBatchFeedback
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
      const res = await CreateFeedback(payload);

      // ใช้ diary ตัวแรกเป็น "ล่าสุด"
      if (selectedDiaryIDs[0]) {
        localStorage.setItem("last_feedback_diary_id", String(selectedDiaryIDs[0]));
      }

      const created = res?.data ?? res;
      window.dispatchEvent(
        new CustomEvent("feedback:created", {
          detail: {
            diaryIds: selectedDiaryIDs,
            items: Array.isArray(created) ? created : [created],
            scope: "diary",
          },
        })
      );

      setNotification({ message: "ส่งFeedback รวมสำเร็จ", success: true });
      setShowBatchFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedDiaryIDs([]);
    } catch (error) {
      console.error(error);
      setNotification({ message: "ส่งFeedback รวมไม่สำเร็จ", success: false });
    }
  };


  const formatTime = (dateString: any) => {
    return new Date(dateString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // --- helper ฟังก์ชัน grouping ---
  const groupDiariesByDate = (diaries: DiaryInterface[]) => {
    return diaries.reduce((groups: Record<string, DiaryInterface[]>, diary) => {
      if (!diary.CreatedAt) return groups;
      const date = new Date(diary.CreatedAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(diary);
      return groups;
    }, {});
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDiaryId, setSelectedDiaryId] = useState<number | null>(null);

  // เปิด modal
  const handleOpenDeleteModal = (id: number) => {
    setSelectedDiaryId(id);
    setIsDeleteModalOpen(true);
  };

  // ปิด modal
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedDiaryId(null);
  };

  // ยืนยันลบ
  const handleConfirmDelete = async () => {
  if (selectedDiaryId) {
    try {
      await DeleteDiaryById(selectedDiaryId); // 🚀 call API ลบ
      message.success("ลบ Diary สำเร็จ");
      setNotification({ message: "ลบ Diary สำเร็จ", success: true });

      // โหลดข้อมูลใหม่หลังลบ
      setTimeout(() => {
        window.location.reload();
      }, 1500); 
    } catch (error) {
      message.error("ไม่สามารถลบ Diary ได้");
      setNotification({ message: "ไม่สามารถลบ Diary ได้", success: false });
    }
  }
  setIsDeleteModalOpen(false);
  setSelectedDiaryId(null);
};

  if (loading) return <div className="!min-h-screen !bg-white !p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="!relative !min-h-screen !bg-gradient-to-br !from-white-50 !via-white !to-indigo-50 translate-x-15">
      <div className="!container !mx-auto !px-4 !py-8 !max-w-7xl">
        {/* Header Section */}
        <div className="!mb-8">
          <button
            onClick={() => window.history.back()}
            className="!inline-flex !items-center !mb-6 !text-gray-600 hover:!text-blue-600 !transition-colors !duration-200 !group"
          >
            <ArrowLeft className="!h-5 !w-5 !mr-2 group-hover:!-translate-x-1 !transition-transform !duration-200" />
            กลับ
          </button>

          <div className="!text-center !mb-8">
            <div className="!inline-flex !items-center !justify-center !w-20 !h-20 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !rounded-full !mb-4 !shadow-lg">
              <BookOpen className="!h-10 !w-10 !text-white" />
            </div>
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">
              Diary ทั้งหมด
            </h1>
            <p className="!text-gray-600 !text-lg !max-w-2xl !mx-auto">
              บันทึกความคิดและความรู้สึกของผู้ป่วย เพื่อติดตามความคืบหน้าและให้คำแนะนำที่เหมาะสม
            </p>
          </div>

          {/* Action Buttons */}
          <div className="!flex !justify-center !space-x-4">
            <button
              onClick={() => setShowBatchFeedbackModal(true)}
              className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-white !px-8 !py-3 !rounded-xl !font-semibold !shadow-lg hover:!shadow-xl !transition-all !duration-200 !flex !items-center !space-x-2"
            >
              <MessageCircle className="!h-5 !w-5" />
              <span>ส่ง Feedback แบบรวม</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6 !mb-8">
          <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-100">
            <div className="!flex !items-center">
              <div className="!bg-blue-100 !p-3 !rounded-xl">
                <FileText className="!h-6 !w-6 !text-blue-600" />
              </div>
              <div className="!ml-4">
                <p className="!text-2xl !font-bold !text-gray-900">{diaries.length}</p>
                <p className="!text-gray-600">รายการทั้งหมด</p>
              </div>
            </div>
          </div>
          <div className="!bg-white !rounded-2xl !p-6 !shadow-sm !border !border-gray-100">
            <div className="!flex !items-center">
              <div className="!bg-green-100 !p-3 !rounded-xl">
                <Clock className="!h-6 !w-6 !text-green-600" />
              </div>
              <div className="!ml-4">
                <p className="!text-2xl !font-bold !text-gray-900">{filteredDiaries.length}</p>
                <p className="!text-gray-600">ช่วงเวลาปัจจุบัน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diary Content */}
        {diaries.length === 0 ? (
          <div className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-gray-100">
            <div className="!inline-flex !items-center !justify-center !w-24 !h-24 !bg-gray-100 !rounded-full !mb-6">
              <FileText className="!h-12 !w-12 !text-gray-400" />
            </div>
            <h3 className="!text-2xl !font-semibold !text-gray-900 !mb-2">ยังไม่มี Diary</h3>
            <p className="!text-gray-500 !text-lg">ไม่พบบันทึก Diary สำหรับเคสนี้</p>
          </div>
        ) : (
          <div className="!space-y-8">
            {Object.entries(groupDiariesByDate(diaries)).map(([date, diariesOnDate]) => (
              <div key={date} className="!bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !overflow-hidden">
                {/* Date Header */}
                <div className="!bg-gradient-to-r !from-gray-50 !to-gray-100 !px-8 !py-6 !border-b !border-gray-200">
                  <div className="!flex !items-center !space-x-3">
                    <div className="!bg-blue-100 !p-2 !rounded-lg">
                      <CalendarDays className="!h-6 !w-6 !text-blue-600" />
                    </div>
                    <div>
                      <h2 className="!text-xl !font-bold !text-gray-900">{date}</h2>
                      <p className="!text-gray-600">{diariesOnDate.length} รายการ</p>
                    </div>
                  </div>
                </div>

                {/* Diaries Grid */}
                <div className="!p-8">
                  <div className="!grid !grid-cols-1 lg:!grid-cols-2 xl:!grid-cols-3 !gap-6">
                    {diariesOnDate.map((diary, index) => (
                      <div
                        key={diary.ID}
                        className="!group !bg-gradient-to-br !from-white !to-gray-50 !border !border-gray-200 !rounded-2xl !p-6 hover:!shadow-lg hover:!border-blue-200 !transition-all !duration-300 hover:!-translate-y-1"
                      >
                        <button
                          onClick={() => handleOpenDeleteModal(diary.ID!)}
                          className="!absolute !top-3 !right-3 !bg-red-500 hover:!bg-red-600 !text-white !rounded-full !p-2 !shadow-md !transition-all !duration-200"
                        >
                          <Trash className="!h-4 !w-4" />
                        </button>
                        <div className="!flex !items-start !justify-between !mb-4">
                          <div className="!flex !items-start !space-x-3 !flex-1">
                            <div className="!bg-gradient-to-br !from-blue-100 !to-indigo-100 !p-2 !rounded-xl !flex-shrink-0">
                              <FileText className="!h-5 !w-5 !text-blue-600" />
                            </div>
                            <div className="!min-w-0 !flex-1">
                              <h3 className="!font-semibold !text-gray-900 !mb-1 !line-clamp-2">
                                {diary.Title || `Diary รายการที่ ${index + 1}`}
                              </h3>
                              <div className="!flex !items-center !text-sm !text-gray-500 !space-x-2">
                                <Clock className="!h-4 !w-4" />
                                <span>{formatTime(diary.CreatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="!mb-4 !h-15">
                          <p className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed">
                            {diary.Content?.replace(/<[^>]+>/g, "") || "ไม่มีเนื้อหา"}
                          </p>
                        </div>

                        <div className="!flex !items-center !justify-between !pt-4 !border-t !border-gray-100">
                          <div className="!flex !items-center !text-xs !text-gray-500 !space-x-4">
                            <span>{diary.Content?.length || 0} ตัวอักษร</span>
                          </div>
                          <button
                            onClick={() => handleOpenReadDiary(diary)}
                            className="!bg-gray-100 hover:!bg-gray-200 !text-gray-700 !px-3 !py-1 !rounded-lg !text-sm"
                          >
                            ดูรายละเอียด
                          </button>
                          <button
                            onClick={() => handleOpenDiaryFeedback(diary.ID!)}
                            className="!bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !inline-flex !items-center !space-x-2 !shadow-sm hover:!shadow-md !transition-all !duration-200"
                          >
                            <Send className="!h-4 !w-4" />
                            <span>ส่ง Feedback</span>
                          </button>
                        </div>
                        <button
                          onClick={() => navigate(`/psychologist/diary/patient/feedback-history/${diary.ID}`)}
                          className="!bg-gray-400 !hover:bg-white !text-white !px-4 !py-2 !rounded-lg !text-sm !flex !items-center !gap-2 !w-full !mt-2 cursor-pointer"
                        >
                          <MessageSquare className="h-4 w-4" />
                          ดู Feedback ที่เคยส่ง
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Individual Diary Feedback Modal */}
        {showDiaryFeedbackModal && (
          <div className="!absolute !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !max-w-md !w-full !p-8 !shadow-2xl !transform !transition-all !duration-300 !scale-100 !max-h-[90vh] !overflow-y-auto">
              <div className="!flex !items-center !justify-between !mb-6">
                <h2 className="!text-2xl !font-bold !text-gray-900">ส่ง Feedback</h2>
                <button
                  className="!text-gray-400 hover:!text-gray-600 !transition-colors !p-2 hover:!bg-gray-100 !rounded-lg"
                  onClick={() => {
                    setShowDiaryFeedbackModal(false);
                    setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" }); // เคลียร์ form
                  }}
                >
                  <X className="!h-6 !w-6" />
                </button>
              </div>

              <div className="!space-y-4">
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">หัวข้อ Feedback</label>
                  <input
                    type="text"
                    placeholder="ใส่หัวข้อ Feedback ที่ต้องการส่ง"
                    value={feedbackForm.FeedbackTitle}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                  />
                </div>

                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">เนื้อหา Feedback</label>
                  <textarea
                    placeholder="เขียนข้อเสนอแนะและคำแนะนำสำหรับผู้ป่วย"
                    value={feedbackForm.FeedbackContent}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 !h-32 !resize-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  disabled={!feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()}
                  className={`!w-full !bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white !py-3 !rounded-xl !font-semibold !shadow-lg !flex !items-center !justify-center !space-x-2
            ${!feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim() ? "opacity-50 cursor-not-allowed" : "hover:!from-green-700 hover:!to-emerald-700 hover:!shadow-xl"}
          `}
                >
                  <Send className="!h-5 !w-5" />
                  <span>ส่ง Feedback</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Batch Feedback Modal */}
        {showBatchFeedbackModal && (
          <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !max-w-2xl !w-full !p-8 !shadow-2xl !transform !transition-all !duration-300 !scale-100 !max-h-[90vh] !overflow-y-auto">
              <div className="!flex !items-center !justify-between !mb-6">
                <h2 className="!text-2xl !font-bold !text-gray-900">ส่ง Feedback แบบรวม</h2>
                <button
                  className="!text-gray-400 hover:!text-gray-600 !transition-colors !p-2 hover:!bg-gray-100 !rounded-lg"
                  onClick={() => {
                    setShowBatchFeedbackModal(false);
                    setSelectedDiaryIDs([]);
                    setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
                    setSelectedFeedbackTimeID(null);
                  }}
                >
                  <X className="!h-6 !w-6" />
                </button>
              </div>

              <div className="!space-y-6">
                {/* Feedback Time Selection */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-3">เลือกช่วงเวลา</label>
                  <div className="!flex !flex-wrap !gap-2">
                    {feedbackTimes
                      .filter(ft => ft.ID && ft.ID >= 2 && ft.ID <= 4)
                      .map(ft => (
                        <button
                          key={ft.ID}
                          className={`!px-4 !py-2 !rounded-xl !font-medium !transition-all !duration-200 ${selectedFeedbackTimeID === ft.ID
                            ? "!bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white !shadow-lg"
                            : "!bg-gray-100 !text-gray-700 hover:!bg-gray-200"
                            }`}
                          onClick={() => {
                            setSelectedFeedbackTimeID(ft.ID!);
                            setSelectedDiaryIDs([]);
                            setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
                          }}
                        >
                          {ft.FeedbackTimeName}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Diary Selection */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-3">
                    เลือก Diary ({selectedDiaryIDs.length} จาก {filteredDiaries.length} รายการ)
                  </label>
                  <div className="!max-h-48 !overflow-y-auto !border !border-gray-200 !rounded-xl !p-4 !bg-gray-50">
                    <div className="!space-y-3">
                      {filteredDiaries.map(d => (
                        <label key={d.ID} className="!flex !items-start !space-x-3 !cursor-pointer hover:!bg-white !p-2 !rounded-lg !transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedDiaryIDs.includes(d.ID!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDiaryIDs([...selectedDiaryIDs, d.ID!]);
                              } else {
                                setSelectedDiaryIDs(selectedDiaryIDs.filter(id => id !== d.ID));
                              }
                            }}
                            className="!mt-0.5 !rounded !border-gray-300 !text-blue-600 focus:!ring-blue-500"
                          />
                          <div className="!flex-1 !min-w-0">
                            <p className="!font-medium !text-gray-900 !truncate">
                              {d.Title || `Diary ${d.ID}`}
                            </p>
                            <p className="!text-sm !text-gray-600 !line-clamp-2">
                              {d.Content?.replace(/<[^>]+>/g, "").substring(0, 100)}...
                            </p>
                          </div>
                        </label>
                      ))}
                      {filteredDiaries.length === 0 && (
                        <p className="!text-gray-500 !text-center !py-4">ไม่มี Diary ในช่วงเวลาที่เลือก</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback Form */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">หัวข้อ Feedback</label>
                  <input
                    type="text"
                    placeholder="ใส่หัวข้อ Feedback รวม"
                    value={feedbackForm.FeedbackTitle}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                  />
                </div>

                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">เนื้อหา Feedback</label>
                  <textarea
                    placeholder="เขียนข้อเสนอแนะรวมสำหรับ Diary ที่เลือก"
                    value={feedbackForm.FeedbackContent}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 !h-32 !resize-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowModalBatch(true);
                  }}
                  disabled={
                    !selectedFeedbackTimeID ||
                    selectedDiaryIDs.length === 0 ||
                    !feedbackForm.FeedbackTitle.trim() ||
                    !feedbackForm.FeedbackContent.trim()
                  }
                  className={`!w-full !bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white !py-3 !rounded-xl !font-semibold !shadow-lg !flex !items-center !justify-center !space-x-2
    ${!selectedFeedbackTimeID || selectedDiaryIDs.length === 0 || !feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()
                      ? "disabled:!from-gray-400 disabled:!to-gray-500 disabled:!cursor-not-allowed opacity-50"
                      : "hover:!from-green-700 hover:!to-emerald-700 hover:!shadow-xl"
                    }
  `}
                >
                  <Send className="!h-5 !w-5" />
                  <span>ส่ง Feedback รวม</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {showReadDiaryModal && readingDiary && (
          <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !max-w-lg !w-full !p-6 !shadow-2xl !transform !transition-all !duration-300 !scale-100">
              {/* Header */}
              <div className="!flex !items-center !justify-between !mb-4 !border-gray-200 !border-b-2">
                <h2 className="!text-xl !font-bold !text-gray-900">
                  {readingDiary.Title || "Diary"}
                </h2>
                <button
                  className="!text-gray-400 hover:!text-gray-600 !transition-colors !p-2 hover:!bg-gray-100 !rounded-lg"
                  onClick={() => setShowReadDiaryModal(false)}
                >
                  <X className="!h-6 !w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="!space-y-4">
                <div className="!text-sm !text-gray-500">
                  <Clock className="!h-4 !w-4 !inline-block !mr-1" />
                  {new Date(readingDiary.CreatedAt!).toLocaleString("th-TH")}
                </div>

                <div
                  className="!prose !max-w-none !text-gray-800"
                  dangerouslySetInnerHTML={{ __html: readingDiary.Content || "<p>ไม่มีเนื้อหา</p>" }}
                />
              </div>

              {/* Footer */}
              <div className="!mt-6 !flex !justify-end">
                <button
                  onClick={() => setShowReadDiaryModal(false)}
                  className="!bg-gray-100 hover:!bg-gray-200 !text-gray-700 !px-4 !py-2 !rounded-lg !text-sm"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-60">
          <div className="!bg-white !p-6 !rounded-lg !max-w-md !w-full !space-y-4">
            <h2 className="!text-xl !font-bold">ยืนยันการส่ง Feedback </h2>
            <p>คุณต้องการส่ง Feedback ใช่หรือไม่?</p>
            <div className="!flex !justify-end !gap-3">
              <button onClick={() => setShowModal(false)} className="!px-4 !py-2 !bg-gray-200 !rounded">ยกเลิก</button>
              <button onClick={() => { handleSubmitDiaryFeedback(); setShowModal(false); }} className="!px-4 !py-2 !bg-blue-600 !text-white !rounded">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
      {showModalBatch && (
        <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-60">
          <div className="!bg-white !p-6 !rounded-lg !max-w-md !w-full !space-y-4">
            <h2 className="!text-xl !font-bold">ยืนยันการส่ง Feedback รวม</h2>
            <p>คุณต้องการส่ง Feedback รวมใช่หรือไม่?</p>
            <div className="!flex !justify-end !gap-3">
              <button onClick={() => setShowModalBatch(false)} className="!px-4 !py-2 !bg-gray-200 !rounded">ยกเลิก</button>
              <button onClick={() => { handleSubmitBatchFeedback(); setShowModalBatch(false); }} className="!px-4 !py-2 !bg-blue-600 !text-white !rounded">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
      {notification && (
        <div
          className={`!absolute  !top-5 !left-1/2 !transform !-translate-x-1/2 !px-4 !py-3 !rounded-lg !shadow-lg ${notification.success ? '!bg-green-500' : '!bg-red-500'} !text-white !flex !items-center !justify-between !max-w-sm !transition-opacity !duration-500 !z-60`}
          style={{ opacity: notification ? 1 : 0 }}
        >
          <span>{notification.message}</span>
          <button className="!ml-3 !font-bold" onClick={() => setNotification(null)}>x</button>
        </div>
      )}
      <Modal
        title="ยืนยันการลบ Diary"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="ลบ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบ Diary นี้? การลบไม่สามารถกู้คืนได้</p>
      </Modal>
    </div>
  );
}
