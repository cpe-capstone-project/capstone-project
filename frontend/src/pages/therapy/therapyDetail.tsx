import  { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar,List } from 'lucide-react';
import type { TherapyInterface } from "../../interfaces/ITherapy"
import {
  GetTherapyCaseByID,
} from "../../services/https/TherapyCase";

export default function TherapyCaseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [caseDetail, setCaseDetail] = useState<TherapyInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  console.log('caseDetail: ',caseDetail)

  useEffect(() => {
  if (!id) return;

  const fetchCaseDetail = async () => {
  setLoading(true);
  try {
    const response = await GetTherapyCaseByID(Number(id));
    console.log("response.data:", response.data);

    // ตรวจสอบว่ามี element ใน array หรือเปล่า
    if (response.data && response.data.length > 0) {
      setCaseDetail(response.data[0]); // เอาตัวแรกถ้าเป็น array
    } else {
      setCaseDetail(null);
    }
  } catch (error) {
    console.error("Error fetching therapy case:", error);
    setCaseDetail(null);
  } finally {
    setLoading(false);
  }
  };

  fetchCaseDetail();
}, [id]);

  const handleBack = () => navigate(-1);
  const handleDiaryClick = () => {
    if (caseDetail?.ID) navigate(`/psychologist/diary/patient/${caseDetail.ID}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!caseDetail) {
    return (
      <div className="!min-h-screen !bg-white !p-8">
        <div className="!max-w-4xl !mx-auto !flex !justify-center !items-center !min-h-[400px]">
          <div className="!text-center">
            <p className="!text-gray-600 !text-lg">ไม่พบข้อมูลเคสการบำบัด</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-white !p-8">
      <div className="!max-w-4xl !mx-auto">
        {/* Header with Dropdown Menu */}
        <div className="!mb-8">
          <div className="!flex !items-center !justify-between !mb-6">
            <button
              onClick={handleBack}
              className="!inline-flex !items-center !px-4 !py-2 !text-sm !font-medium !text-gray-600 !hover:!text-gray-900 !transition-colors"
            >
              <ArrowLeft className="!h-5 !w-5 !mr-2" />
              กลับ
            </button>
            
            {/* เมนู Diary - ย้ายมาอยู่ขวาบน */}
            <div className="!relative !inline-block !text-left">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="!inline-flex !justify-between !items-center !w-48 !px-4 !py-2 !bg-gray-100 !rounded-md !hover:!bg-gray-200 !focus:outline-none"
              >
                <List className="!w-5 !h-5 !mr-2" />
                <span>เมนู</span>
                <span className="ml-2">{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div className="!origin-top-right !absolute !right-0 !mt-2 !w-48 !rounded-md !shadow-lg !bg-white !ring-1 !ring-black !ring-opacity-5 !focus:outline-none z-10">
                  <div className="!py-1">
                    <button
                      onClick={handleDiaryClick}
                      className="!w-full !text-left !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                    >
                      ดู Diary ทั้งหมด
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="!text-center">
            <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">รายละเอียดเคสการบำบัด</h1>
            <p className="!text-gray-600 !text-lg">ข้อมูลการบำบัดและผู้เกี่ยวข้อง</p>
          </div>
        </div>

        {/* Case Status Badge */}
        <div className="!flex !justify-center !mb-8">
          <div 
            className="!inline-flex !items-center !px-4 !py-2 !rounded-full !text-sm !font-medium !text-white"
          >
            <div className="!w-2 !h-2 !bg-white !rounded-full !mr-2"></div>
            {caseDetail.CaseStatus?.StatusName}
          </div>
        </div>

        <div className="!space-y-8">
          {/* Case Information */}
          <div className="!bg-white !border !border-gray-200 !rounded-lg !p-6">
            <h2 className="!text-xl !font-semibold !text-gray-900 !mb-6 !flex !items-center">
              <FileText className="!h-6 !w-6 !mr-2" />
              ข้อมูลการบำบัด
            </h2>
            
            <div className="!space-y-4">
              <div>
                <label className="!text-sm !font-medium !text-gray-500">ชื่อเคสการบำบัด</label>
                <p className="!text-base !text-gray-900 !mt-1">{caseDetail.CaseTitle}</p>
              </div>
              
              <div>
                <label className="!text-sm !font-medium !text-gray-500">รายละเอียดการบำบัด</label>
                <p className="!text-base !text-gray-900 !mt-1 !leading-relaxed">{caseDetail.CaseDescription}</p>
              </div>
              
              <div>
                <label className="!text-sm !font-medium !text-gray-500 !flex !items-center">
                  <Calendar className="!h-4 !w-4 !mr-1" />
                  วันที่เริ่มการบำบัด
                </label>
                <p className="!text-base !text-gray-900 !mt-1">
                  {caseDetail.CaseStartDate && formatDate(caseDetail.CaseStartDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="!bg-white !border !border-gray-200 !rounded-lg !p-6">
            <h3 className="!text-xl !font-semibold !text-gray-900 !mb-6 !flex !items-center">
              <User className="!h-6 !w-6 !mr-2" />
              ข้อมูลผู้ป่วย
            </h3>
            
            <div className="!space-y-4">
              <div>
                <label className="!text-sm !font-medium !text-gray-500">ชื่อ-นามสกุล</label>
                <p className="!text-base !text-gray-900 !mt-1">
                  {caseDetail.Patient?.FirstName} {caseDetail.Patient?.LastName}
                </p>
              </div>
              
              <div>
                <label className="!text-sm !font-medium !text-gray-500">อีเมล</label>
                <p className="!text-base !text-gray-900 !mt-1">{caseDetail.Patient?.Email}</p>
              </div>
              
              <div>
                <label className="!text-sm !font-medium !text-gray-500">เบอร์โทรศัพท์</label>
                <p className="!text-base !text-gray-900 !mt-1">{caseDetail.Patient?.Phone}</p>
              </div>
              
              {caseDetail.Patient?.Gender && (
                <div>
                  <label className="!text-sm !font-medium !text-gray-500">เพศ</label>
                  <p className="!text-base !text-gray-900 !mt-1">{caseDetail.Patient.Gender}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}