import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { GetDiariesByTherapyCaseID } from "../../services/https/TherapyCase";
import { CreateFeedback } from "../../services/https/Feedback";
import { DeleteDiaryById, } from "../../services/https/Diary";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { Modal, message, Input, Button } from "antd";
import { ArrowLeft, FileText, BookOpen, Send, CalendarDays, MessageCircle, Clock, Trash } from "lucide-react";

export default function DiaryList() {
  const { id } = useParams<{ id: string }>();
  const myID = localStorage.getItem("id");
  const navigate = useNavigate();


  const [diaries, setDiaries] = useState<DiaryInterface[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal State
  const [showDiaryFeedbackModal, setShowDiaryFeedbackModal] = useState(false);


  const [selectedDiaryID, setSelectedDiaryID] = useState<number | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    FeedbackTitle: "",
    FeedbackContent: "",
  });

  const [selectedFeedbackTimeID] = useState<number | null>(null);
  const [filteredDiaries, setFilteredDiaries] = useState<DiaryInterface[]>([]);
  const [showReadDiaryModal, setShowReadDiaryModal] = useState(false);
  const [readingDiary, setReadingDiary] = useState<DiaryInterface | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [showModalBatch, setShowModalBatch] = useState(false);
  const [notification, setNotification] = useState<{ message: string, success: boolean } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false); // โหมดเลือกหรือไม่
  const [selectedDiaries, setSelectedDiaries] = useState<number[]>([]); // เก็บ Diary ที่เลือก
  const diariesGridRef = useRef<HTMLDivElement>(null);
  const [lockedTimeFilter, setLockedTimeFilter] = useState<string | null>(null);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<"all" | "day" | "week" | "month">("all");

  const filterDiariesByTime = (diaries: DiaryInterface[]) => {
    const now = new Date();
    return diaries.filter(diary => {
      const created = new Date(diary.CreatedAt || "");
      if (selectedTimeFilter === "all") return true;
      if (selectedTimeFilter === "day") return created.toDateString() === now.toDateString();
      if (selectedTimeFilter === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return created >= weekStart && created <= weekEnd;
      }
      if (selectedTimeFilter === "month") return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredTimeDiaries = filterDiariesByTime(diaries);
  const now = new Date();
  // วันนี้
  const today = now.toLocaleDateString("th-TH");
  // สัปดาห์นี้ (Sunday – Saturday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // วันอาทิตย์
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // วันเสาร์
  const weekRange = `${weekStart.toLocaleDateString("th-TH")} - ${weekEnd.toLocaleDateString("th-TH")}`;
  // เดือนนี้
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthRange = `${monthStart.toLocaleDateString("th-TH")} - ${monthEnd.toLocaleDateString("th-TH")}`;

  // ฟังก์ชัน toggle เลือก/ยกเลิกเลือก diary
  const handleSelectDiary = (id: number) => {
    if (!lockedTimeFilter) {
      setLockedTimeFilter(selectedTimeFilter); // ล็อกช่วงเวลาที่เลือก
    }

    if (selectedDiaries.includes(id)) {
      setSelectedDiaries(selectedDiaries.filter(d => d !== id));
      // ถ้าเลือกกลับหมด ให้ปลดล็อกเวลา
      if (selectedDiaries.length === 1) {
        setLockedTimeFilter(null);
      }
    } else {
      setSelectedDiaries([...selectedDiaries, id]);
    }
  };

  const openNotification = (message: string, success: boolean) => {
    setNotification({ message, success });
  };
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  // --- ฟังก์ชันเปิด Modal อ่าน Diary ---
  const handleOpenReadDiary = (diary: DiaryInterface) => {
    setReadingDiary(diary);
    setShowReadDiaryModal(true);
  };
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

      openNotification("ส่งFeedback สำเร็จ", true);
      setShowDiaryFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedDiaryID(null);
    } catch (error) {
      console.error(error);
      openNotification("ส่งFeedback ไม่สำเร็จ", false);
    }
  };

  // ⬇️ แก้ในฟังก์ชัน handleSubmitBatchFeedback
  const handleSubmitBatchFeedback = async () => {
    if (selectedDiaries.length === 0) return;
    try {
      // mapping filter → FeedbackTimeID
      let feedbackTimeId: number | undefined;

      if (selectedTimeFilter === "all") {
        feedbackTimeId = 1;
      } else if (selectedTimeFilter === "day") {
        feedbackTimeId = 2;
      } else if (selectedTimeFilter === "week") {
        feedbackTimeId = 3;
      } else if (selectedTimeFilter === "month") {
        feedbackTimeId = 4;
      }

      const payload = {
        FeedbackTitle: feedbackForm.FeedbackTitle,
        FeedbackContent: feedbackForm.FeedbackContent,
        PsychologistID: Number(myID),
        PatientID: Number(id),
        FeedbackTypeID: 1,
        FeedbackTimeID: feedbackTimeId, // ✅ ส่งค่าที่แมปมา
        DiaryIDs: selectedDiaries,
      };

      const res = await CreateFeedback(payload);
      console.log("payload", payload);

      if (selectedDiaries[0]) {
        localStorage.setItem("last_feedback_diary_id", String(selectedDiaries[0]));
      }

      const created = res?.data ?? res;
      window.dispatchEvent(
        new CustomEvent("feedback:created", {
          detail: {
            diaryIds: selectedDiaries,
            items: Array.isArray(created) ? created : [created],
            scope: "diary",
          },
        })
      );

      openNotification("ส่งFeedback รวมสำเร็จ", true);
      setSelectedDiaries([]);
      setShowModalBatch(false);
      setIsSelecting(false);
      setLockedTimeFilter(null)
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
    } catch (error) {
      console.error(error);
      openNotification("ส่งFeedback รวมไม่สำเร็จ", false);
    }
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
              onClick={() => { setIsSelecting(true); diariesGridRef.current?.scrollIntoView({ behavior: "smooth" }); }}
              className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !text-white !px-8 !py-3 !rounded-xl !font-semibold !shadow-lg hover:!shadow-xl !transition-all !duration-200 !flex !items-center !space-x-2"
            >
              <MessageCircle className="!h-5 !w-5" />
              <span>ส่ง Feedback แบบรวม</span>
            </button>
          </div>

          {/* Sticky Selection Panel + Feedback Form */}
          {isSelecting && (
            <div className="!sticky !top-6 !bg-white !p-4 !rounded-xl !shadow-lg !flex !flex-col !space-y-4 !mb-6 !z-20">
              {/* เลข + ชื่อ Diary ที่เลือก */}
              <div>
                <span className="!font-semibold !text-gray-700">
                  เลือกแล้ว {selectedDiaries.length} รายการ
                </span>
                <div className="!flex !flex-wrap !gap-2 !mt-2">
                  {selectedDiaries.map(id => {
                    const diary = diaries.find(d => d.ID === id);
                    return (
                      <span key={id} className="!bg-blue-100 !text-blue-800 !px-2 !py-1 !rounded-full !text-sm">
                        {diary?.Title || `Diary #${id}`}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Form */}
              <div className="!flex !flex-col !space-y-3">
                <input
                  type="text"
                  placeholder="หัวข้อ Feedback รวม"
                  value={feedbackForm.FeedbackTitle}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                  className="!w-full !border !border-gray-300 !rounded-xl !p-3 focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                />
                <textarea
                  placeholder="เขียนข้อเสนอแนะรวมสำหรับ Diary ที่เลือก"
                  value={feedbackForm.FeedbackContent}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                  className="!w-full !border !border-gray-300 !rounded-xl !p-3 !h-32 !resize-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500 !transition-colors"
                />
              </div>
              {/* Action Buttons */}
              <div className="!flex !space-x-4 !mt-2">
                <button
                  onClick={() => {
                    if (selectedDiaries.length === 0 || !feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()) {
                      alert("กรุณากรอกหัวข้อ, เนื้อหา และเลือก Diary อย่างน้อย 1 รายการ");
                      return;
                    }
                    setShowModalBatch(true)
                    console.log("ส่ง Feedback รวม:", {
                      diaryIDs: selectedDiaries,
                      ...feedbackForm,
                    });
                  }}
                  className={`!bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white !px-6 !py-3 !rounded-xl !font-semibold !shadow-lg !flex !items-center !justify-center !space-x-2
          ${selectedDiaries.length === 0 || !feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()
                      ? "disabled:!from-gray-400 disabled:!to-gray-500 disabled:!cursor-not-allowed opacity-50"
                      : "hover:!from-green-700 hover:!to-emerald-700 hover:!shadow-xl"
                    }
        `}
                >
                  <Send className="!h-5 !w-5" />
                  <span>ส่ง Feedback รวม</span>
                </button>

                <button
                  onClick={() => {
                    setIsSelecting(false);
                    setSelectedDiaries([]);
                    setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
                    setLockedTimeFilter(null)
                  }}
                  className="!bg-gray-300 hover:!bg-gray-400 !text-gray-700 !px-4 !py-3 !rounded-xl !font-semibold !shadow-sm"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          )}


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
          <div className="!flex !space-x-3 !mb-6">
            {["all", "day", "week", "month"].map(option => (
              <button
                key={option}
                disabled={!!lockedTimeFilter && lockedTimeFilter !== option}
                className={`!px-4 !py-2 !rounded-xl !font-medium transition-colors
        ${selectedTimeFilter === option
                    ? "!bg-gradient-to-r !from-blue-600 !to-indigo-600 !text-white !shadow-lg"
                    : "!bg-gray-100 !text-gray-700 hover:bg-gray-200"}
        ${!!lockedTimeFilter && lockedTimeFilter !== option ? "!opacity-50 !cursor-not-allowed" : ""}
      `}
                onClick={() => {
                  if (!lockedTimeFilter) {
                    setSelectedTimeFilter(option as any);
                  }
                }}
              >
                {option === "all" ? "ทั้งหมด" :
                  option === "day" ? "วันนี้" :
                    option === "week" ? "สัปดาห์นี้" : "เดือนนี้"}
              </button>
            ))}
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
          <div ref={diariesGridRef} className="!space-y-8">
            {Object.entries(groupDiariesByDate(diaries)).map(([date]) => (
              <div key={date} className="!bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !overflow-hidden">
                {/* Date Header */}
                <div className="!bg-gradient-to-r !from-gray-50 !to-gray-100 !px-8 !py-6 !border-b !border-gray-200">
                  <div className="!flex !items-center !space-x-3">
                    <div className="!bg-blue-100 !p-2 !rounded-lg">
                      <CalendarDays className="!h-6 !w-6 !text-blue-600" />
                    </div>
                    <div>
                      <h2 className="!text-xl !font-bold !text-gray-900">
                        {(() => {
                          switch (selectedTimeFilter) {
                            case "day":
                              return `วันนี้ (${today})`;
                            case "week":
                              return `สัปดาห์นี้ (${weekRange})`;
                            case "month":
                              return `เดือนนี้ (${monthRange})`;
                            default:
                              return `ทั้งหมด`;
                          }
                        })()}
                      </h2>
                      <p className="!text-gray-600">{filteredTimeDiaries.length} รายการ</p>
                    </div>
                    {isSelecting && (
                      <div className="!sticky !top-6  !p-4 !rounded-xl  !flex !flex-col !space-y-4 !mb-6 !ml-225">
                        <div className="!flex !justify-end !mb-2">
                          <button
                            onClick={() => {
                              const filteredIds = filteredTimeDiaries.map(d => d.ID!);
                              if (selectedDiaries.length === filteredIds.length) {
                                // ยกเลิกทั้งหมด
                                setSelectedDiaries([]);
                                setLockedTimeFilter(null);
                              } else {
                                // เลือกทั้งหมด
                                setSelectedDiaries(filteredIds);
                                setLockedTimeFilter(selectedTimeFilter);
                              }
                            }}
                            className="!px-4 !py-2 !bg-gray-200 !rounded-lg hover:!bg-gray-300 !text-sm !font-medium"
                          >
                            {selectedDiaries.length === filteredTimeDiaries.length ? "ยกเลิกเลือกทั้งหมด" : "เลือกทั้งหมด"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


                {/* Diaries Grid */}
                <div className="!p-8">
                  <div className="!grid !grid-cols-1 lg:!grid-cols-2 xl:!grid-cols-3 !gap-6">
                    {filteredTimeDiaries.map((diary, index) => (

                      <div
                        key={diary.ID}
                        className="!relative !bg-gradient-to-br !from-white !to-gray-50 !border !border-gray-200 !rounded-2xl !p-6 hover:!shadow-lg hover:!border-blue-200 !transition-all !duration-300"
                      >
                        {isSelecting && (
                          <div className="!absolute !top-3 !right-3">
                            <input
                              type="checkbox"
                              checked={selectedDiaries.includes(diary.ID!)}
                              onChange={() => handleSelectDiary(diary.ID!)}
                              className="!h-5 !w-5 !text-blue-600 !rounded !border-gray-300"
                            />
                          </div>
                        )}
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
                                <span>{diary ? new Date(diary.CreatedAt!).toLocaleString("th-TH") : ""}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="!mb-4 !h-15">
                          <p className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed">
                            {diary.Content?.replace(/<[^>]+>/g, "") || "ไม่มีเนื้อหา"}
                          </p>
                        </div>
                        <div className="!flex !items-center !justify-between !pt-4 !border-t !border-gray-100" ></div>
                        <div className="!flex !items-center !text-m !font-semibold !text-gray-900 !space-x-4 ">
                          <span>ผลการวิเคราะห์อารมณ์</span>
                        </div>
                        <div className="!mb-1 !h-15">
                          {diary.EmotionAnalysisResults?.map((result, index) => (
                            <p
                              key={index}
                              className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed"
                            >
                              - {result.PrimaryEmotion}
                            </p>
                          ))}
                        </div>
                        <div className="!flex !items-center !justify-between !pt-1 !border-t !border-gray-100">
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
                            onClick={() => navigate(`/psychologist/diary/patient/feedback-history/${diary.ID}`)}
                            className=" !bg-gray-100 hover:!bg-gray-200 !text-gray-700 !px-3 !py-1 !rounded-lg !text-sm"
                          >
                            <span>ประวัติ Feedback </span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleOpenDiaryFeedback(diary.ID!)}
                          className="!bg-green-600 !to-emerald-600 !hover:bg-white !text-white !px-4 !py-2 !rounded-lg !text-sm !flex !items-center !gap-2 !w-full !mt-2 cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                          ส่ง Feedback
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(diary.ID!)}
                          className="!bg-red-600 !hover:bg-red-700 !text-white !px-4 !py-2 !rounded-lg !text-sm !flex !items-center !gap-2 !w-full !mt-2 cursor-pointer"
                        ><span>ลบ Feedback </span>
                          <Trash className="!h-4 !w-4" />
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
        <Modal
          title="ส่ง Feedback"
          open={showDiaryFeedbackModal}
          onCancel={() => {
            setShowDiaryFeedbackModal(false);
            setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
          }}
          footer={null} // เราจะใส่ปุ่มเองในเนื้อหา
          centered
          width={500}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}
        >
          <div className="!space-y-4">
            <div>
              <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">หัวข้อ Feedback</label>
              <Input
                placeholder="ใส่หัวข้อ Feedback ที่ต้องการส่ง"
                value={feedbackForm.FeedbackTitle}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
              />
            </div>

            <div>
              <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">เนื้อหา Feedback</label>
              <Input.TextArea
                placeholder="เขียนข้อเสนอแนะและคำแนะนำสำหรับผู้ป่วย"
                value={feedbackForm.FeedbackContent}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                rows={6}
              />
            </div>

            <Button
              type="primary"
              block
              icon={<Send />}
              disabled={!feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()}
              onClick={() => setShowModal(true)}
            >
              ส่ง Feedback
            </Button>
          </div>
        </Modal>
        <Modal
          title={readingDiary?.Title || "Diary"}
          open={showReadDiaryModal}
          onCancel={() => setShowReadDiaryModal(false)}
          footer={[
            <Button key="close" onClick={() => setShowReadDiaryModal(false)}>
              ปิด
            </Button>,
          ]}
          centered
          width={500}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div className="!space-y-4">
            {/* วันที่สร้าง */}
            <div className="!text-sm !text-gray-500 !flex !items-center !gap-1">
              <Clock className="!h-4 !w-4" />
              <span>{readingDiary ? new Date(readingDiary.CreatedAt!).toLocaleString("th-TH") : ""}</span>
            </div>

            {/* เนื้อหา Diary */}
            <div
              className="!prose !max-w-none !text-gray-800"
              dangerouslySetInnerHTML={{ __html: readingDiary?.Content || "<p>ไม่มีเนื้อหา</p>" }}
            />

            {/* ผลการวิเคราะห์อารมณ์ */}
            {readingDiary?.EmotionAnalysisResults && readingDiary.EmotionAnalysisResults.length > 0 && (
              <div className="!mt-4">
                <h3 className="!font-semibold !text-gray-900 !mb-2">ผลการวิเคราะห์อารมณ์</h3>
                <ul className="!list-disc !list-inside !text-gray-700 !text-sm !space-y-1">
                  {readingDiary.EmotionAnalysisResults.map((result, index) => (
                    <li key={index}>
                      {result.PrimaryEmotion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      </div>
      <Modal
        title="ยืนยันการส่ง Feedback"
        open={showModal}
        centered
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        onOk={() => {
          handleSubmitDiaryFeedback();
          setShowModal(false);
        }}
        onCancel={() => setShowModal(false)}
      >
        <p>คุณต้องการส่ง Feedback ใช่หรือไม่?</p>
      </Modal>
      <Modal
        title="ยืนยันการส่ง Feedback รวม"
        open={showModalBatch}
        centered
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        onOk={() => {
          handleSubmitBatchFeedback();
          setShowModalBatch(false);
        }}
        onCancel={() => setShowModalBatch(false)}
      >
        <p>คุณต้องการส่ง Feedback รวมใช่หรือไม่?</p>
      </Modal>
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
      {notification && (
        <div
          className={`!fixed !top-5 !left-1/2 !transform !-translate-x-1/2 
                !px-4 !py-3 !rounded-lg !shadow-lg 
                ${notification.success ? '!bg-green-500' : '!bg-red-500'} 
                !text-white !flex !items-center !justify-between !max-w-sm !z-[9999]`}
        >
          <span>{notification.message}</span>
          <button
            className="!ml-3 !font-bold"
            onClick={() => setNotification(null)}
          >
            x
          </button>
        </div>
      )}
    </div>
  );
}
