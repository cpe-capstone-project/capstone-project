import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Clock, User, History, Calendar, FileText } from "lucide-react";
import { GetFeedbackByDiaryID } from "../../services/https/Feedback";
import { GetDiaryById } from "../../services/https/Diary";
import type { FeedBackInterface } from "../../interfaces/IFeedback";
import type { DiaryInterface } from "../../interfaces/IDiary";

export default function FeedbackHistoryDiary() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<FeedBackInterface[]>([]);
    const [diary, setDiary] = useState<DiaryInterface | null>(null);
    const [loading, setLoading] = useState(true);
    console.log(diary)

    useEffect(() => {
        if (id) {
            setLoading(true);
            // ดึง Feedbacks
            GetFeedbackByDiaryID(Number(id))
                .then((data) => setFeedbacks(data))
                .catch((err) => console.error(err));

            // ดึงข้อมูล Diary
            GetDiaryById(Number(id))
                .then((data) => setDiary(data.data))
                .catch((err) => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const formatThaiDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div className="!space-y-4 !translate-x-25">
                <div className="!animate-pulse">
                    <div className="!h-8 !bg-gray-200 !rounded !w-1/3 !mb-4"></div>
                    <div className="!space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="!h-24 !bg-gray-200 !rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="!space-y-4  !ml-50 !mr-50 !mt-10 !mb-10">
            {/* Header */}
            <div className="!flex !items-center !gap-3 !mb-6 ">
                <button
                    onClick={() => navigate(-1)}
                    className="!text-gray-600 hover:!text-gray-900 !transition-colors !duration-200 !flex"
                >
                    <ArrowLeft className="!h-5 !w-5 !mr-2" /> <span> กลับ</span>
                </button>
            </div>
            <div className="!text-center !mb-8">
                <div className="!inline-flex !items-center !justify-center !w-20 !h-20 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !rounded-full !mb-4 !shadow-lg">
                    <History className="!h-10 !w-10 !text-white" />
                </div>
                <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">
                    Feedback ของ Diary: {diary?.Title || "ไม่ระบุชื่อ"}
                </h1>
                <p className="!text-gray-600 !text-lg !max-w-2xl !mx-auto">
                    ประวัติทั้งหมดของ Diary: {diary?.Title || "ไม่ระบุชื่อ"}
                </p>
            </div>
            {/* Summary Card */}
            <div className="!bg-gradient-to-r !from-blue-500 !to-purple-600 !rounded-lg !p-4 !text-white !mb-4">
                <div className="!flex !items-center !justify-between">
                    <div>
                        <h2 className="!text-lg !font-semibold">สรุป Feedback</h2>
                        <p className="!text-blue-100">จำนวนทั้งหมด {feedbacks.length} รายการ</p>
                    </div>
                    <MessageSquare className="!h-8 !w-8 !text-white !opacity-80" />
                </div>
            </div>

            {/* Feedback List */}
            {feedbacks.length === 0 ? (
                <div className="!text-center !py-12">
                    <FileText className="!h-16 !w-16 !text-gray-300 !mx-auto !mb-4" />
                    <p className="!text-gray-500 !text-lg">ยังไม่มี Feedback ที่เคยส่ง</p>
                    <p className="!text-gray-400 !text-sm">เมื่อมีการส่ง feedback จะแสดงที่นี่</p>
                </div>
            ) : (
                <div className="!space-y-4">
                    {feedbacks.map((fb, index) => (
                        <div
                            key={fb.ID}
                            className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm hover:!shadow-md !transition-shadow !duration-200 !overflow-hidden"
                        >
                            {/* Card Header */}
                            <div className="!bg-gray-50 !px-4 !py-3 !border-b !border-gray-200">
                                <div className="!flex !items-center !justify-between">
                                    <div className="!flex !items-center !gap-3">
                                        <span className="!bg-blue-500 !text-white !text-sm !font-semibold !px-2 !py-1 !rounded-full">
                                            #{index + 1}
                                        </span>
                                        {fb.FeedbackTitle && (
                                            <h3 className="!font-semibold !text-gray-900">
                                                {fb.FeedbackTitle}
                                            </h3>
                                        )}
                                    </div>
                                    {fb.CreatedAt && (
                                        <div className="!flex !items-center !gap-1 !text-sm !text-gray-500">
                                            <Calendar className="!h-4 !w-4" />
                                            <span>{formatThaiDate(fb.CreatedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="!p-4">
                                {/* Feedback Content */}
                                <div className="!mb-4">
                                    <div className="!bg-blue-50 !border-l-4 !border-blue-400 !p-3 !rounded-r">
                                        <p className="!text-gray-800 !leading-relaxed">
                                            {fb.FeedbackContent || "ไม่มีเนื้อหา feedback"}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata Grid */}
                                <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-3 !text-sm">
                                    {/* Psychologist */}
                                    {fb.Psychologist && (
                                        <div className="!flex !items-center !gap-2 !p-2 !bg-green-50 !rounded">
                                            <User className="!h-4 !w-4 !text-green-600 !flex-shrink-0" />
                                            <div>
                                                <span className="!text-gray-600">นักจิตวิทยา:</span>
                                                <span className="!font-medium !text-green-700 !ml-1">
                                                    {fb.Psychologist.FirstName || "ไม่ระบุชื่อ"}{" "}{fb.Psychologist.LastName || "ไม่ระบุชื่อ"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Patient */}
                                    {fb.Patient && (
                                        <div className="!flex !items-center !gap-2 !p-2 !bg-purple-50 !rounded">
                                            <User className="!h-4 !w-4 !text-purple-600 !flex-shrink-0" />
                                            <div>
                                                <span className="!text-gray-600">ผู้ป่วย:</span>
                                                <span className="!font-medium !text-purple-700 !ml-1">
                                                    {fb.Patient.FirstName || "ไม่ระบุชื่อ"}{" "}{fb.Patient.LastName || "ไม่ระบุชื่อ"}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Feedback Time */}
                                    {fb.FeedbackTime && (
                                        <div className="!flex !items-center !gap-2 !p-2 !bg-orange-50 !rounded">
                                            <Clock className="!h-4 !w-4 !text-orange-600 !flex-shrink-0" />
                                            <div>
                                                <span className="!text-gray-600">ประเภท:</span>
                                                <span className="!font-medium !text-orange-700 !ml-1">
                                                    {fb.FeedbackTime.FeedbackTimeName || "ไม่ระบุเวลา"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Thought Record Connection */}
                                {fb.ThoughtRecord && (
                                    <div className="!mt-3 !p-3 !bg-yellow-50 !border !border-yellow-200 !rounded-lg">
                                        <div className="!flex !items-center !gap-2">
                                            <FileText className="!h-4 !w-4 !text-yellow-600" />
                                            <span className="!text-sm !text-gray-600">
                                                เชื่อมต่อกับ Thought Record ID:
                                                <span className="!font-medium !text-yellow-700 !ml-1">
                                                    #{fb.ThoughtRecordID}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Diary IDs */}
                                {fb.DiaryIDs && fb.DiaryIDs.length > 0 && (
                                    <div className="!mt-3 !p-3 !bg-indigo-50 !border !border-indigo-200 !rounded-lg">
                                        <div className="!flex !items-start !gap-2">
                                            <FileText className="!h-4 !w-4 !text-indigo-600 !mt-0.5" />
                                            <div>
                                                <span className="!text-sm !text-gray-600">Diary IDs ที่เกี่ยวข้อง:</span>
                                                <div className="!flex !flex-wrap !gap-1 !mt-1">
                                                    {fb.DiaryIDs.map((diaryId, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="!inline-block !bg-indigo-100 !text-indigo-800 !text-xs !font-medium !px-2 !py-1 !rounded"
                                                        >
                                                            #{diaryId}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}