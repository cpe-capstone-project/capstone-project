import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, FileText, Brain, X, Send, Clock, CalendarDays, MessageSquare } from "lucide-react";

import { GetThoughtRecordsByTherapyCaseID } from "../../services/https/ThoughtRecord";
import { CreateFeedback } from "../../services/https/Feedback";

import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord";

export default function ThoughtRecordList() {
  const { id } = useParams<{ id: string }>();
  const myID = localStorage.getItem("id");
  const navigate = useNavigate();

  const [records, setRecords] = useState<ThoughtRecordInterface[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState<ThoughtRecordInterface | null>(null);

  // Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRecordID, setSelectedRecordID] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string, success: boolean } | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    FeedbackTitle: "",
    FeedbackContent: "",
  });

  const handleOpenDetail = (record: ThoughtRecordInterface) => {
    setSelectedRecordDetail(record);
    setShowDetailModal(true);
  };

  // โหลด Thought Record ของเคส
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    GetThoughtRecordsByTherapyCaseID(Number(id))
      .then((res) => {
        if (Array.isArray(res)) {
          setRecords(res);
        } else {
          setRecords([]);
          console.warn("Unexpected response:", res);
        }
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [id]);

  // จัดกลุ่มตามวัน
  const groupedRecords = records.reduce((acc: Record<string, ThoughtRecordInterface[]>, record) => {
    const date = record.CreatedAt
      ? new Date(record.CreatedAt).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
      : "ไม่ระบุวัน";
    if (!acc[date]) acc[date] = [];
    acc[date].push(record);
    return acc;
  }, {});

  const handleOpenFeedback = (recordID: number) => {
    setSelectedRecordID(recordID);
    setShowFeedbackModal(true);
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // 3000ms = 3 วินาที
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmitFeedback = async () => {
    if (!selectedRecordID) return;
    setNotification({ message: `ส่งFeedback ไม่สำเร็จ`, success: false });
    try {
      const payload = {
        FeedbackTitle: feedbackForm.FeedbackTitle,
        FeedbackContent: feedbackForm.FeedbackContent,
        PsychologistID: Number(myID),
        PatientID: Number(id),
        FeedbackTypeID: 2,
        FeedbackTimeID: 1,
        ThoughtRecordID: selectedRecordID
      };
      await CreateFeedback(payload);
      setNotification({ message: `ส่งFeedback สำเร็จ`, success: true });
      setShowFeedbackModal(false);
      setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" });
      setSelectedRecordID(null);
    } catch (error) {
      console.error(error);
      setNotification({ message: `ส่งFeedback ไม่สำเร็จ`, success: false });
    }
  };

  const formatTime = (dateString: any) =>
    new Date(dateString).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  if (loading)
    return <div className="!min-h-screen !bg-white !p-8 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-white-50 !via-white !to-indigo-50 translate-x-15">
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
              <Brain className="!h-10 !w-10 !text-white" />
            </div>
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">Thought Record</h1>
            <p className="!text-gray-600 !text-lg !max-w-2xl !mx-auto">
              แบบบันทึกความคิด (Thought Record) ของผู้ป่วย เพื่อใช้ติดตามและส่ง Feedback
            </p>
          </div>
        </div>

        {/* Content */}
        {records.length === 0 ? (
          <div className="!bg-white !rounded-2xl !p-12 !text-center !shadow-sm !border !border-gray-100">
            <div className="!inline-flex !items-center !justify-center !w-24 !h-24 !bg-gray-100 !rounded-full !mb-6">
              <FileText className="!h-12 !w-12 !text-gray-400" />
            </div>
            <h3 className="!text-2xl !font-semibold !text-gray-900 !mb-2">ยังไม่มี Thought Record</h3>
            <p className="!text-gray-500 !text-lg">ไม่พบบันทึก Thought Record สำหรับเคสนี้</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedRecords).map(([date, recordsOfDay]) => (
              <div key={date} className="!bg-white !rounded-2xl !shadow-sm !border !border-gray-100 !overflow-hidden">
                {/* หัวข้อวัน */}
                <div className="!bg-gradient-to-r !from-gray-50 !to-gray-100 !px-8 !py-6 !border-b !border-gray-200">
                  <div className="!flex !items-center !space-x-3">
                    <div className="!bg-blue-100 !p-2 !rounded-lg">
                      <CalendarDays className="!h-6 !w-6 !text-blue-600" />
                    </div>
                    <div>
                      <h2 className="!text-xl !font-bold !text-gray-900">{date}</h2>
                      <p className="!text-gray-600">{recordsOfDay.length} รายการ</p>
                    </div>
                  </div>
                </div>

                <div className="!grid !grid-cols-1 md:!grid-cols-2 xl:!grid-cols-3 !gap-6">
                  {recordsOfDay.map((record, index) => (
                    <div
                      key={record.ID}
                      className="!group !bg-gradient-to-br !from-white !to-gray-50 !border !border-gray-200 !rounded-2xl !p-6 hover:!shadow-lg hover:!border-blue-200 !transition-all !duration-300 hover:!-translate-y-1 !m-2 !flex !flex-col !justify-between !h-[350px]"
                    >
                      <div className="!flex !items-start !justify-between !mb-4">
                        <div className="!flex !items-start !space-x-3 !flex-1">
                          <div className="!bg-gradient-to-br !from-blue-100 !to-indigo-100 !p-2 !rounded-xl !flex-shrink-0">
                            <FileText className="!h-5 !w-5 !text-blue-600" />
                          </div>
                          <div className="!min-w-0 !flex-1">
                            <h3 className="!font-semibold !text-gray-900 !mb-1 !line-clamp-2">
                              {record.Situation || `Thought Record ${index + 1}`}
                            </h3>
                            <div className="!flex !items-center !text-sm !text-gray-500 !space-x-2">
                              <Clock className="!h-4 !w-4" />
                              <span>{formatTime(record.CreatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="!mb-2">
                        <p className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed">
                          <strong>Thoughts:</strong> {record.Thoughts?.replace(/<[^>]+>/g, "") || "ไม่มีเนื้อหา"}
                        </p>
                        <p className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed">
                          <strong>Behaviors:</strong> {record.Behaviors?.replace(/<[^>]+>/g, "") || "ไม่มีเนื้อหา"}
                        </p>
                        <p className="!text-gray-700 !line-clamp-3 !text-sm !leading-relaxed">
                          <strong>Alternate Thought:</strong> {record.AlternateThought?.replace(/<[^>]+>/g, "") || "ไม่มีเนื้อหา"}
                        </p>
                      </div>

                      <div className="!flex !flex-wrap !gap-2 !pt-4 !border-t !border-gray-100">
                        <button
                          onClick={() => handleOpenDetail(record)}
                          className="!bg-gray-200 hover:!bg-gray-300 !text-black !px-4 !py-2 !rounded-lg !text-sm !font-medium !mr-20"
                        >
                          ดูรายละเอียด
                        </button>

                        <button
                          onClick={() => handleOpenFeedback(record.ID!)}
                          className="!bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !inline-flex !items-center !space-x-2 !shadow-sm hover:!shadow-md !transition-all !duration-200"
                        >
                          <Send className="!h-4 !w-4" />
                          <span>ส่ง Feedback</span>
                        </button>

                        <button
                          onClick={() => navigate(`/psychologist/thought/patient/feedback-history/${record.ID}`)}
                          className="!bg-gray-400 !hover:bg-white !text-white !px-4 !py-2 !rounded-lg !text-sm !flex !items-center !gap-2 !cursor-pointer !w-full"
                        >
                          <MessageSquare className="h-4 w-4" />
                          ดู Feedback ที่เคยส่ง
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !max-w-md !w-full !p-8 !shadow-2xl !max-h-[90vh] !overflow-y-auto">
              <div className="!flex !items-center !justify-between !mb-6">
                <h2 className="!text-2xl !font-bold !text-gray-900">ส่ง Feedback</h2>
                <button
                  className="!text-gray-400 hover:!text-gray-600 !p-2 hover:!bg-gray-100 !rounded-lg"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedbackForm({ FeedbackTitle: "", FeedbackContent: "" }); // เคลียร์ข้อมูล
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
                    placeholder="ใส่หัวข้อ Feedback"
                    value={feedbackForm.FeedbackTitle}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackTitle: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500"
                  />
                </div>

                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-2">เนื้อหา Feedback</label>
                  <textarea
                    placeholder="เขียนข้อเสนอแนะสำหรับ Thought Record"
                    value={feedbackForm.FeedbackContent}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, FeedbackContent: e.target.value })}
                    className="!w-full !border !border-gray-300 !rounded-xl !p-3 !h-32 !resize-none focus:!ring-2 focus:!ring-blue-500 focus:!border-blue-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowModal(true);
                  }}
                  disabled={!feedbackForm.FeedbackTitle.trim() || !feedbackForm.FeedbackContent.trim()} // ปิดปุ่มถ้าว่าง
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
        {/* Detail Modal */}
        {showDetailModal && selectedRecordDetail && (
          <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
            <div className="!bg-white !rounded-2xl !max-w-2xl !w-full !shadow-xl !overflow-hidden !max-h-[90vh] !flex !flex-col">
              {/* Header */}
              <div className="!px-6 !py-5 !border-b !border-gray-200">
                <div className="!flex !items-center !justify-between">
                  <h2 className="!text-xl !font-semibold !text-gray-900">รายละเอียด Thought Record</h2>
                  <button
                    className="!text-gray-400 hover:!text-gray-600 !p-2 hover:!bg-gray-100 !rounded-lg !transition-colors"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <X className="!h-5 !w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="!flex-1 !overflow-y-auto !p-6">
                <div className="!space-y-6">
                  {/* Situation */}
                  <div>
                    <h3 className="!text-sm !font-medium !text-gray-700 !mb-2">สถานการณ์</h3>
                    <div className="!bg-gray-50 !rounded-lg !p-4">
                      <p className="!text-gray-900 !leading-relaxed">
                        {selectedRecordDetail.Situation || "ไม่ได้ระบุสถานการณ์"}
                      </p>
                    </div>
                  </div>

                  {/* Thoughts */}
                  <div>
                    <h3 className="!text-sm !font-medium !text-gray-700 !mb-2">ความคิด</h3>
                    <div className="!bg-gray-50 !rounded-lg !p-4">
                      <p className="!text-gray-900 !leading-relaxed">
                        {selectedRecordDetail.Thoughts?.replace(/<[^>]+>/g, "") || "ไม่มีการบันทึกความคิด"}
                      </p>
                    </div>
                  </div>

                  {/* Behaviors */}
                  <div>
                    <h3 className="!text-sm !font-medium !text-gray-700 !mb-2">พฤติกรรม</h3>
                    <div className="!bg-gray-50 !rounded-lg !p-4">
                      <p className="!text-gray-900 !leading-relaxed">
                        {selectedRecordDetail.Behaviors?.replace(/<[^>]+>/g, "") || "ไม่มีการบันทึกพฤติกรรม"}
                      </p>
                    </div>
                  </div>

                  {/* Alternate Thought */}
                  <div>
                    <h3 className="!text-sm !font-medium !text-gray-700 !mb-2">ความคิดทางเลือก</h3>
                    <div className="!bg-gray-50 !rounded-lg !p-4">
                      <p className="!text-gray-900 !leading-relaxed">
                        {selectedRecordDetail.AlternateThought?.replace(/<[^>]+>/g, "") || "ไม่มีการบันทึกความคิดทางเลือก"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="!px-6 !py-4 !border-t !border-gray-200">
                <div className="!flex !justify-end">
                  <button
                    className="!bg-gray-600 hover:!bg-gray-700 !text-white !px-4 !py-2 !rounded-lg !font-medium !transition-colors"
                    onClick={() => setShowDetailModal(false)}
                  >
                    ปิด
                  </button>
                </div>
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
              <button onClick={() => { handleSubmitFeedback(); setShowModal(false); }} className="!px-4 !py-2 !bg-blue-600 !text-white !rounded">ยืนยัน</button>
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
    </div>
  );
}

