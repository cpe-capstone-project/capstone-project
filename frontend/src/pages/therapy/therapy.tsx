import { useState, useEffect } from 'react';
import { Search, Plus, Edit, List, Trash2, BookText, Pen } from 'lucide-react';
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

  const filteredCases = cases.filter(case_ =>
    case_.CaseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.Patient?.FirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.Patient?.LastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    try {
      const confirmed = window.confirm("คุณต้องการลบเคสนี้หรือไม่?");
      if (!confirmed) return;

      await DeleteTherapyCase(id);
      setCases((prev) => prev.filter((item) => item.ID !== id));

      alert("ลบเคสสำเร็จ!");
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการลบเคส:", error);
      alert("ไม่สามารถลบเคสได้");
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="!min-h-screen !bg-white !p-8 !items-center">
      <div className="!max-w-7xl !mx-auto !flex !flex-col !items-center translate-x-15">
        {/* Header */}
        <div className="!mb-8 !w-full">
          <div className="!text-center !mb-8">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">
              Therapy Case Management
            </h1>
            <p className="!text-gray-600 !text-lg">
              จัดการข้อมูลการบำบัดและติดตามผลการรักษา
            </p>
          </div>

          {/* Search and Create Button */}
          <div className="!flex !flex-col sm:!flex-row !justify-between !items-center !gap-4">
            <div className="!relative !w-full sm:!w-96">
              <div className="!absolute !inset-y-0 !left-0 !pl-4 !flex !items-center !pointer-events-none">
                <Search className="!h-5 !w-5 !text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ป่วย, นักจิตวิทยา หรือ อาการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!block !w-full !pl-12 !pr-4 !py-3 !border !border-gray-300 !rounded-lg !bg-white !placeholder-gray-500 !focus:outline-none !focus:ring-2 !focus:ring-gray-900 !focus:border-transparent !transition-all !duration-200"
              />
            </div>

            <button
              onClick={handleCreateNew}
              className="!inline-flex !items-center !px-6 !py-3 !text-base !font-medium !rounded-lg !text-white !bg-gray-900 !hover:bg-gray-800 !focus:outline-none !focus:ring-2 !focus:ring-offset-2 !focus:ring-gray-900 !transition-all !duration-200 cursor-pointer"
            >
              <Plus className="!h-5 !w-5 !mr-2" />
              เพิ่มเคสใหม่
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="!w-full !bg-white !border !border-gray-200 !rounded-3xl !overflow-hidden">
          <table className="!min-w-full !divide-y !divide-gray-200 !rounded-3xl">
            <thead className="!bg-gray-50">
              <tr>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900 !w-20">ลำดับ</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">ผู้ป่วย</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">การบำบัด</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">วันที่เริ่ม</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">สถานะ</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">ไดอารี่วันนี้</th>
                <th className="!px-6 !py-4 !text-left !text-sm !font-semibold !text-gray-900">แบบทดสอบวันนี้</th>
                <th className="!px-6 !py-4 !text-center !text-sm !font-semibold !text-gray-900 !w-32">จัดการ</th>
              </tr>
            </thead>
            <tbody className="!bg-white !divide-y !divide-gray-200">
              {filteredCases.map((case_, index) => (
                <tr key={case_.ID} className="!hover:bg-gray-50 !transition-colors !duration-150">
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!text-sm !font-medium !text-gray-900">{index + 1}</div>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!text-sm !font-medium !text-gray-900">
                      {case_.Patient?.FirstName || "ไม่ทราบชื่อ"} {case_.Patient?.LastName || "ไม่ทราบชื่อ"}
                    </div>
                  </td>
                  <td className="!px-6 !py-4">
                    <div className="!max-w-xs">
                      <div className="!text-sm !font-medium !text-gray-900 !mb-1">{case_.CaseTitle}</div>
                      <div className="!text-sm !text-gray-500 !line-clamp-2">{case_.CaseDescription}</div>
                    </div>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!text-sm !text-gray-500">
                      {case_.CaseStartDate ? new Date(case_.CaseStartDate).toLocaleDateString('th-TH') : '-'}
                    </div>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <span className="!inline-flex !px-3 !py-1 !rounded-full !text-xs !font-medium">
                      {case_.CaseStatus?.StatusName}
                    </span>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!flex !items-center !space-x-1">
                      <BookText className="!h-4 !w-4 !text-gray-600" />
                      {diaryStatus[case_.ID ?? 0] ? (
                        <span className="!text-green-600 !font-medium">เขียนแล้ว </span>
                      ) : (
                        <span className="!text-red-500 !font-medium">ยังไม่ได้เขียน </span>
                      )}
                    </div>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!flex !items-center !space-x-1">
                      <Pen className="!h-4 !w-4 !text-gray-600" />
                      {thoughtStatus[case_.ID ?? 0] ? (
                        <span className="!text-green-600 !font-medium">เขียนแล้ว </span>
                      ) : (
                        <span className="!text-red-500 !font-medium">ยังไม่ได้เขียน </span>
                      )}
                    </div>
                  </td>
                  <td className="!px-6 !py-4 !whitespace-nowrap">
                    <div className="!flex !items-center !justify-center !space-x-1">
                      <button onClick={() => handleEdit(case_.ID)} className="!text-gray-600 !hover:text-gray-900 !p-2 !rounded-md !hover:bg-gray-100 !transition-all !duration-150 cursor-pointer" title="แก้ไข">
                        <Edit className="!h-4 !w-4" />
                      </button>
                      <button onClick={() => handleView(case_.ID)} className="!text-gray-600 !hover:text-gray-900 !p-2 !rounded-md !hover:bg-gray-100 !transition-all !duration-150 cursor-pointer" title="ดูรายละเอียด">
                        <List className="!h-4 !w-4" />
                      </button>
                      <button onClick={() => handleDelete(case_.ID)} className="!text-gray-600 !hover:text-red-600 !p-2 !rounded-md !hover:bg-gray-100 !transition-all !duration-150 cursor-pointer" title="ลบ">
                        <Trash2 className="!h-4 !w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCases.length === 0 && (
            <div className="!text-center !py-12">
              <div className="!w-12 !h-12 !bg-gray-100 !rounded-full !flex !items-center !justify-center !mx-auto !mb-4">
                <Search className="!h-6 !w-6 !text-gray-400" />
              </div>
              <div className="!text-gray-500 !text-lg !font-medium">ไม่พบข้อมูลที่ค้นหา</div>
              <div className="!text-gray-400 !text-sm !mt-1">
                ลองค้นหาด้วยคำค้นหาอื่น หรือสร้างเคสใหม่
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="!mt-6 !text-center">
          <div className="!inline-flex !items-center !px-4 !py-2 !bg-gray-50 !rounded-full !border !border-gray-200">
            <span className="!text-sm !text-gray-600">
              แสดง <span className="!font-semibold !text-gray-900">{filteredCases.length}</span> จาก <span className="!font-semibold !text-gray-900">{cases.length}</span> เคส
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
