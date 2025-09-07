import { useState, useEffect } from 'react';
import { Search, Plus, Edit, List, Trash2, BookText, Pen, Table2Icon } from 'lucide-react';
import { useNavigate } from "react-router";
import {
  GetTherapyCaseByPsychologisId,
  DeleteTherapyCase,
  GetDiariesByTherapyCaseID,
  GetThoughtRecordsByTherapyCaseID
} from "../../services/https/TherapyCase";
import type { TherapyInterface } from "../../interfaces/ITherapy";

export default function TherapyCaseManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<TherapyInterface[]>([]);
  const [diaryStatus, setDiaryStatus] = useState<Record<number, boolean>>({}); // เก็บสถานะไดอารี่วันนี้
  const [thoughtStatus, setThoughtStatus] = useState<Record<number, boolean>>({});

  const [loading, setLoading] = useState(true);
  const psychoIdStr = localStorage.getItem('id');
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string, success: boolean } | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    if (!psychoIdStr) return;

    setLoading(true);
    GetTherapyCaseByPsychologisId(Number(psychoIdStr))
      .then(async (res) => {
        const data = res.data as TherapyInterface[];
        setCases(data);

        // 🔥 เช็ค Diaries และ ThoughtRecord วันนี้สำหรับทุกเคส
        const diaryMap: Record<number, boolean> = {};
        const thoughtMap: Record<number, boolean> = {};

        for (const c of data) {
          if (c.ID) {
            try {
              const resDiary = await GetDiariesByTherapyCaseID(c.ID);
              diaryMap[c.ID] = resDiary?.written_today || false;
            } catch {
              diaryMap[c.ID] = false;
            }

            try {
              const resThought = await GetThoughtRecordsByTherapyCaseID(c.ID);
              thoughtMap[c.ID] = resThought?.written_today || false;
            } catch {
              thoughtMap[c.ID] = false;
            }
          }
        }

        setDiaryStatus(diaryMap);
        setThoughtStatus(thoughtMap);
      })
      .catch((err) => {
        console.error("Error fetching therapy cases:", err);
        setCases([]);
      })
      .finally(() => setLoading(false));
  }, [psychoIdStr]);

  const filteredCases = Array.isArray(cases)
    ? cases.filter(case_ =>
      case_.CaseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.Patient?.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.Patient?.LastName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const handleCreateNew = () => {
    navigate("/psychologist/therapyCreate")
  };
  const handleEdit = (id?: number) => {
    if (!id) return;
    navigate(`/psychologist/therapyUpdate/${id}`);
  };
  const handleView = (id?: number) => {
    if (!id) return;
    navigate(`/psychologist/therapyDetail/${id}`)
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setNotification({ message: "ลบไม่สำเร็จ", success: false });
    try {

      await DeleteTherapyCase(id);
      setCases((prev) => prev.filter((item) => item.ID !== id));
      setNotification({ message: "ลบสำเร็จ", success: true });

    } catch (error) {
      setNotification({ message: "ลบไม่สำเร็จ", success: false });
      console.error("เกิดข้อผิดพลาดในการลบเคส:", error);
    }
  };

  if (loading) {
    return (
      <div className="!min-h-screen !bg-white !p-8">
        <div className="!max-w-4xl !mx-auto !flex !justify-center !items-center !min-h-[400px]">
          <div className="!text-center">
            <div className="!animate-spin !rounded-full !h-12 !w-12 !border-b-2 !border-gray-900 !mx-auto !mb-4"></div>
            <p className="!text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-white !p-8">
      <div className="!max-w-4xl !mx-auto">
        {/* Header */}
        <div className="!mb-8">
          <div className="!text-center !mb-8">
            <div className="!flex !justify-center !mb-4">
              <div className="!inline-flex !items-center !justify-center !w-20 !h-20 !bg-gradient-to-br !from-blue-500 !to-indigo-600 !rounded-full !mb-4 !shadow-lg">
                <Table2Icon className="!h-8 !w-8 !text-white" />
              </div>
            </div>
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">การจัดการเคสการบำบัด</h1>
            <p className="!text-gray-600 !text-lg">จัดการข้อมูลการบำบัดและติดตามผลการรักษา</p>
          </div>

          {/* Search and Create Button */}
          <div className="!flex !flex-col sm:!flex-row !justify-between !items-center !gap-4 !mb-8">
            <div className="!relative !w-full sm:!w-96">
              <div className="!absolute !inset-y-0 !left-0 !pl-4 !flex !items-center !pointer-events-none">
                <Search className="!h-5 !w-5 !text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ป่วย, นักจิตวิทยา หรือ อาการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!block !w-full !pl-12 !pr-4 !py-3 !border !border-gray-300 !rounded-lg !bg-white !placeholder-gray-500 !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !focus:border-transparent !transition-all !duration-200"
              />
            </div>

            <button
              onClick={handleCreateNew}
              className="!inline-flex !items-center !px-6 !py-3 !text-base !font-medium !rounded-lg !text-white !bg-blue-500 !hover:bg-blue-600 !focus:outline-none !focus:ring-2 !focus:ring-offset-2 !focus:ring-blue-500 !transition-all !duration-200 cursor-pointer !shadow-lg"
            >
              <Plus className="!h-5 !w-5 !mr-2" />
              เพิ่มเคสใหม่
            </button>
          </div>
        </div>

        <div className="!space-y-8">
          {/* Cases List */}
          <div className="!bg-white !border !border-gray-200 !rounded-lg !p-6">
            <h2 className="!text-xl !font-semibold !text-gray-900 !mb-6 !flex !items-center">
              <div className="!bg-gradient-to-br !from-blue-500 !to-indigo-500 !p-2 !rounded-xl !flex-shrink-0 !mr-3">
                <List className="!h-5 !w-5 !text-white" />
              </div>
              รายการเคสการบำบัด
            </h2>
            {cases.length === 0 ? (
              <div className="!text-center !py-12">
                <div className="!w-12 !h-12 !bg-gray-100 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
                  <Search className="!h-6 !w-6 !text-gray-400" />
                </div>
                <div className="!text-gray-500 !text-lg !font-medium">ยังไม่มีเคสการบำบัด</div>
                <div className="!text-gray-400 !text-sm !mt-1">
                  คุณสามารถสร้างเคสใหม่ได้โดยกดปุ่ม "เพิ่มเคสใหม่"
                </div>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="!text-center !py-12">
                <div className="!w-12 !h-12 !bg-gray-100 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
                  <Search className="!h-6 !w-6 !text-gray-400" />
                </div>
                <div className="!text-gray-500 !text-lg !font-medium">ไม่พบข้อมูลที่ค้นหา</div>
                <div className="!text-gray-400 !text-sm !mt-1">
                  ลองค้นหาด้วยคำค้นหาอื่น หรือสร้างเคสใหม่
                </div>
              </div>
            ) : (
              <div className="!space-y-4">
                {filteredCases.map((case_, index) => (
                  <div key={case_.ID} className="!border !border-gray-200 !rounded-lg !p-6 !hover:shadow-md !transition-shadow !duration-200">
                    <div className="!flex !items-start !justify-between">
                      <div className="!flex-1">
                        <div className="!flex !items-center !mb-3">
                          <span className="!inline-flex !items-center !justify-center !w-8 !h-8 !bg-blue-100 !text-blue-600 !rounded-full !text-sm !font-semibold !mr-3">
                            {index + 1}
                          </span>
                          <h3 className="!text-lg !font-semibold !text-gray-900">{case_.CaseTitle}</h3>
                          <div className="!ml-4">
                            <span className="!inline-flex !items-center !px-3 !py-1 !rounded-full !text-xs !font-medium !text-black !bg-gray-200">
                              <div className="!w-2 !h-2 !bg-gray-700 !rounded-full !mr-2"></div>
                              {case_.CaseStatus?.StatusName}
                            </span>
                          </div>
                        </div>

                        <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-4 !mb-4">
                          <div>
                            <label className="!text-sm !font-medium !text-gray-500">ผู้ป่วย</label>
                            <p className="!text-base !text-gray-900 !mt-1">
                              {case_.Patient?.FirstName || "ไม่ทราบชื่อ"} {case_.Patient?.LastName || ""}
                            </p>
                          </div>

                          <div>
                            <label className="!text-sm !font-medium !text-gray-500">วันที่เริ่มการบำบัด</label>
                            <p className="!text-base !text-gray-900 !mt-1">
                              {case_.CaseStartDate ? new Date(case_.CaseStartDate).toLocaleDateString('th-TH') : '-'}
                            </p>
                          </div>

                          <div>
                            <label className="!text-sm !font-medium !text-gray-500">สถานะไดอารี่วันนี้</label>
                            <div className="!flex !items-center !space-x-1 !mt-1">
                              <BookText className="!h-4 !w-4 !text-gray-600" />
                              {diaryStatus[case_.ID ?? 0] ? (
                                <span className="!rounded-full !text-black !pl-1 !pr-1  ">เขียนแล้ว</span>
                              ) : (
                                <span className=" !rounded-full !text-black !pl-1 !pr-1 ">ยังไม่ได้เขียน</span>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="!text-sm !font-medium !text-gray-500">แบบทดสอบวันนี้</label>
                            <div className="!flex !items-center !space-x-1 !mt-1">
                              <Pen className="!h-4 !w-4 !text-gray-600" />
                              {thoughtStatus[case_.ID ?? 0] ? (
                                <span className="!rounded-full !text-black !pl-1 !pr-1 ">เขียนแล้ว</span>
                              ) : (
                                <span className=" !rounded-full !text-black !pl-1 !pr-1 ">ยังไม่ได้เขียน</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {case_.CaseDescription && (
                          <div className="!mb-4">
                            <label className="!text-sm !font-medium !text-gray-500">รายละเอียดการบำบัด</label>
                            <p className="!text-base !text-gray-900 !mt-1 !leading-relaxed">{case_.CaseDescription}</p>
                          </div>
                        )}
                      </div>

                      <div className="!flex !items-center !space-x-2 !ml-4">
                        <button
                          onClick={() => handleEdit(case_.ID)}
                          className="!inline-flex !items-center !px-3 !py-2 !text-sm !font-medium !text-gray-600 !hover:text-gray-900 !bg-gray-100 !hover:bg-gray-200 !rounded-lg !transition-colors !duration-200 cursor-pointer"
                          title="แก้ไข"
                        >
                          <Edit className="!h-4 !w-4" />
                        </button>
                        <button
                          onClick={() => handleView(case_.ID)}
                          className="!inline-flex !items-center !px-3 !py-2 !text-sm !font-medium !text-gray-600 !hover:text-gray-900 !bg-gray-100 !hover:bg-gray-200 !rounded-lg !transition-colors !duration-200 cursor-pointer"
                          title="ดูรายละเอียด"
                        >
                          <List className="!h-4 !w-4" />
                        </button>
                        <button
                          onClick={() => setShowModal(true)}
                          className="!inline-flex !items-center !px-3 !py-2 !text-sm !font-medium !text-gray-600 !hover:text-red-600 !bg-gray-100 !hover:bg-red-50 !rounded-lg !transition-colors !duration-200 cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="!h-4 !w-4" />
                        </button>
                      </div>
                    </div>
                    {showModal && (
                      <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center">
                        <div className="!bg-white !p-6 !rounded-lg !max-w-md !w-full !space-y-4">
                          <h2 className="!text-xl !font-bold">ยืนยันการแก้เคส</h2>
                          <p>คุณต้องการลบเคส "{case_.CaseTitle}" ใช่หรือไม่?</p>
                          <div className="!flex !justify-end !gap-3">
                            <button onClick={() => setShowModal(false)} className="!px-4 !py-2 !bg-gray-200 !rounded">ยกเลิก</button>
                            <button onClick={() => { handleDelete(case_.ID); setShowModal(false); }} className="!px-4 !py-2 !bg-red-600 !text-white !rounded">ยืนยัน</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {notification && (
                      <div className={`!fixed !bottom-5 !right-5 !px-4 !py-3 !rounded-lg !shadow-lg ${notification.success ? '!bg-green-500' : '!bg-red-500'} !text-white`}>
                        {notification.message}
                        <button className="!ml-3 !font-bold" onClick={() => setNotification(null)}>x</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="!mt-6 !pt-6 !border-t !border-gray-200 !text-center">
              <div className="!inline-flex !items-center !px-4 !py-2 !bg-gray-50 !rounded-full !border !border-gray-200">
                <span className="!text-sm !text-gray-600">
                  แสดง <span className="!font-semibold !text-gray-900">{filteredCases.length}</span> จาก <span className="!font-semibold !text-gray-900">{cases.length}</span> เคส
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}