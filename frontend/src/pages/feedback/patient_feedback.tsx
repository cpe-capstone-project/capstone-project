import React, { useEffect, useState } from "react";
import { Tabs, Card, Spin, Tag, Empty } from "antd";
import { FileTextOutlined, BulbOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { GetDiaryFeedback, GetThoughtFeedback, GetFeedbackTime } from "../../services/https/Feedback";

const { TabPane } = Tabs;



const PatientFeedback: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [diaryFeedbacks, setDiaryFeedbacks] = useState<any[]>([]);
    const [thoughtFeedbacks, setThoughtFeedbacks] = useState<any[]>([]);
    const [feedbackTimes, setFeedbackTimes] = useState<string[]>([]);
    const patientId = Number(localStorage.getItem("patient_id"));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const diaryRes = await GetDiaryFeedback(patientId);
                console.log("diaryRes: ", diaryRes)
                const thoughtRes = await GetThoughtFeedback(patientId);
                const feedTimeRes = await GetFeedbackTime();
                const timeNames = feedTimeRes.map((ft: any) => ft.FeedbackTimeName);
                setFeedbackTimes(timeNames);
                setDiaryFeedbacks(diaryRes || []);
                setThoughtFeedbacks(thoughtRes || []);
            } catch (err) {
                console.error("Error fetching feedback:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [patientId]);

    if (loading) {
        return (
            <div className="!min-h-screen !bg-gray-50 !flex !justify-center !items-center">
                <div className="!text-center">
                    <Spin size="large" />
                    <p className="!mt-4 !text-gray-500">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    // Group diary feedback by Feedback ID
    const groupedDiaryFeedbacks = diaryFeedbacks.reduce((acc: any, item: any) => {
        if (!acc[item.ID]) {
            acc[item.ID] = { ...item };
        }
        return acc;
    }, {});

    // Filter feedbacks by FeedbackTimeName
    const filterByFeedbackTime = (timeName: string) => {
        return Object.values(groupedDiaryFeedbacks).filter(
            (f: any) => f.FeedbackTimeName === timeName
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="!min-h-screen !bg-gray-50">
            <div className="!max-w-6xl !mx-auto !px-4 !py-8">
                {/* Header */}
                <div className="!bg-white !rounded-xl !shadow-sm !border !border-gray-100 !p-6 !mb-6">
                    <div className="!flex !items-center !gap-3">
                        <div className="!w-12 !h-12 !bg-blue-100 !rounded-xl !flex !items-center !justify-center">
                            <FileTextOutlined className="!text-blue-600 !text-xl" />
                        </div>
                        <div>
                            <h1 className="!text-2xl !font-bold !text-gray-900">ข้อเสนอแนะจากจิตแพทย์</h1>
                            <p className="!text-gray-500">ติดตามความคืบหน้าและข้อเสนอแนะจากผู้เชี่ยวชาญ</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="!bg-white !rounded-xl !shadow-sm !border !border-gray-100">
                    <Tabs
                        defaultActiveKey="diary"
                        className="!px-6 !pt-6"
                        size="large"
                        tabBarStyle={{
                            borderBottom: '2px solid #f1f5f9',
                            marginBottom: 0
                        }}
                    >
                        {/* Diary Feedback Tab */}
                        <TabPane
                            tab={
                                <span className="!flex !items-center !gap-2">
                                    <FileTextOutlined />
                                    Diary Feedback
                                </span>
                            }
                            key="diary"
                        >
                            <div className="!p-6">
                                <Tabs
                                    defaultActiveKey={feedbackTimes[0]}
                                    tabPosition="top"
                                    className="!bg-gray-50 !rounded-lg !p-4"
                                >
                                    {feedbackTimes.map((time) => (
                                        <TabPane tab={time} key={time}>
                                            <div className="!mt-4">
                                                {filterByFeedbackTime(time).length > 0 ? (
                                                    <div className="!space-y-4">
                                                        {filterByFeedbackTime(time).map((f: any) => (
                                                            <Card
                                                                key={f.ID}
                                                                className="hover:!shadow-md !transition-shadow !duration-200 !border-l-4 !border-l-blue-500"
                                                                bodyStyle={{ padding: '20px !important' }}
                                                            >
                                                                <div className="!space-y-4">
                                                                    {/* Title */}
                                                                    <h3 className="!text-lg !font-semibold !text-gray-900">
                                                                        {f.FeedbackTitle}
                                                                    </h3>

                                                                    {/* Content */}
                                                                    <div className="!bg-blue-50 !rounded-lg !p-4">
                                                                        <p className="!text-gray-700 !leading-relaxed">
                                                                            {f.FeedbackContent}
                                                                        </p>
                                                                    </div>

                                                                    {/* Related Diaries */}
                                                                    <div className="!space-y-2">
                                                                        <p className="!text-sm !font-medium !text-gray-600 !flex !items-center !gap-2">
                                                                            <CalendarOutlined />
                                                                            เกี่ยวข้องกับ Diary:
                                                                        </p>
                                                                        <div className="!flex !flex-wrap !gap-2">
                                                                            {f.Diaries && f.Diaries.length > 0 ? (
                                                                                f.Diaries.map((d: string, idx: number) => (
                                                                                    <Tag
                                                                                        key={idx}
                                                                                        className="!rounded-full !px-3 !py-1"
                                                                                    >
                                                                                        {d}
                                                                                    </Tag>
                                                                                ))
                                                                            ) : (
                                                                                <span className="!text-gray-400 !text-sm">ไม่มี Diary ที่เกี่ยวข้อง</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Footer */}
                                                                    <div className="!flex !items-center !justify-between !pt-3 !border-t !border-gray-100">
                                                                        <div className="!flex !items-center !gap-2 !text-sm !text-gray-500">
                                                                            <UserOutlined />
                                                                            <span>โดย: {f.PsychologistFirstName}{" "}{f.PsychologistLastName}</span>
                                                                        </div>
                                                                        <span className="!text-sm !text-gray-400">
                                                                            {formatDate(f.CreatedAt)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="!py-12">
                                                        <Empty
                                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                            description={
                                                                <span className="!text-gray-500">
                                                                    ยังไม่มี {time} Feedback
                                                                </span>
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </TabPane>
                                    ))}
                                </Tabs>
                            </div>
                        </TabPane>

                        {/* Thought Feedback Tab */}
                        <TabPane
                            tab={
                                <span className="!flex !items-center !gap-2">
                                    <BulbOutlined />
                                    Thought Feedback
                                </span>
                            }
                            key="thought"
                        >
                            <div className="!p-6">
                                {thoughtFeedbacks.length > 0 ? (
                                    <div className="!space-y-4">
                                        {thoughtFeedbacks.map((item) => (
                                            <Card
                                                key={item.ID}
                                                className="hover:!shadow-md !transition-shadow !duration-200 !border-l-4 !border-l-green-500"
                                                bodyStyle={{ padding: '20px' }}
                                            >
                                                <div className="!space-y-4">
                                                    {/* Situation */}
                                                    <h3 className="!text-lg !font-semibold !text-gray-900 !flex !items-center !gap-2">
                                                        <BulbOutlined className="!text-green-600" />
                                                        {item.FeedbackTitle}
                                                    </h3>

                                                    {/* Content */}
                                                    <div className="!bg-green-50 !rounded-lg !p-4">
                                                        <p className="!text-gray-700 !leading-relaxed">
                                                            {item.FeedbackContent}
                                                        </p>
                                                    </div>

                                                    <div className="!text-sm !font-medium !text-gray-600  !items-center !gap-2">
                                                        <p className="!text-sm !font-medium !text-gray-600 !flex !items-center !gap-2 !mb-1">
                                                            <CalendarOutlined />
                                                            Thought Record ที่เกี่ยวข้อง:
                                                        </p>
                                                        <Tag className="!rounded-full !px-3 !py-1">
                                                            {item.Situation}
                                                        </Tag>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="!flex !items-center !justify-between !pt-3 !border-t !border-gray-100">
                                                        <div className="!flex !items-center !gap-2 !text-sm !text-gray-500">
                                                            <UserOutlined />
                                                            <span>โดย: {item.PsychologistFirstName}{" "}{item.PsychologistLastName}</span>
                                                        </div>
                                                        <span className="!text-sm !text-gray-400">
                                                            {formatDate(item.CreatedAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="!py-12">
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description={
                                                <span className="!text-gray-500">
                                                    ยังไม่มี Thought Feedback
                                                </span>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default PatientFeedback;