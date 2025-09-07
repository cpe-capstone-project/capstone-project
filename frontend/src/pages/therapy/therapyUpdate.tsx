import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import {
    GetTherapyCaseByID,
    UpdateTherapyCase,
    GetCaseStatuses,
} from "../../services/https/TherapyCase";
import type { TherapyInterface } from "../../interfaces/ITherapy";
import type { CaseStatusInterface } from "../../interfaces/ICaseStatus";


export default function EditTherapyCasePage() {
    const navigate = useNavigate();
    const { id } = useParams(); // รับ id จาก path
    const psychoIdStr = localStorage.getItem("id");
    const [casesStatus, setCasesStatus] = useState<CaseStatusInterface[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [notification, setNotification] = useState<{ message: string, success: boolean } | null>(null);
    console.log("casesStatus", casesStatus)

    const [formData, setFormData] = useState<TherapyInterface>({
        CaseTitle: "",
        CaseDescription: "",
        CaseStartDate: "",
        CaseStatusID: 1,
        PsychologistID: 0,
        PatientID: 0,
    });

    type FormErrors = Partial<Record<keyof TherapyInterface, string>>;
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000); // 3000ms = 3 วินาที
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const res = await GetCaseStatuses();
                if (res) {
                    setCasesStatus(res.data); // สมมติ backend คืน array [{ID, StatusName, ...}]
                }
            } catch (error) {
                console.error("Error fetching case statuses:", error);
            }
        };

        fetchStatuses();
    }, []);

    // โหลดข้อมูลเคสมาแสดง
    useEffect(() => {
        if (id) {
            GetTherapyCaseByID(Number(id))
                .then((res) => {
                    console.log("📌 API Response:", res.data); // ดูโครงสร้าง

                    const dataArray = res.data; // res.data เป็น Array
                    if (!dataArray || dataArray.length === 0) return;

                    const data = dataArray[0]; // ใช้ element แรก

                    setFormData({
                        CaseTitle: data.CaseTitle,
                        CaseDescription: data.CaseDescription,
                        CaseStartDate: data.CaseStartDate
                            ? data.CaseStartDate.split("T")[0]
                            : "",
                        CaseStatusID: data.CaseStatusID,
                        PsychologistID: data.PsychologistID,
                        PatientID: data.PatientID,
                    });
                })
                .catch((err) => console.error("❌ โหลดข้อมูลล้มเหลว:", err));
        }
    }, [id]);




    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof TherapyInterface]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Partial<Record<keyof TherapyInterface, string>> = {};
        if (!formData.CaseTitle?.trim())
            newErrors.CaseTitle = "กรุณากรอกชื่อเคสการบำบัด";
        if (!formData.CaseDescription?.trim())
            newErrors.CaseDescription = "กรุณากรอกรายละเอียดการบำบัด";
        if (!formData.CaseStartDate)
            newErrors.CaseStartDate = "กรุณาเลือกวันที่เริ่มการบำบัด";
        if (!formData.PatientID) newErrors.PatientID = "กรุณาเลือกผู้ป่วย";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setNotification({ message: "กรอกข้อมูลไม่ครบ", success: false });
        try {

            const psychoIdNum = Number(psychoIdStr);
            if (!Number.isFinite(psychoIdNum)) {
                return;
            }
            const payload = {
                case_title: formData.CaseTitle,
                case_description: formData.CaseDescription,
                case_start_date: formData.CaseStartDate,
                patient_id: Number(formData.PatientID),
                psychologist_id: Number(psychoIdStr),
                case_status_id: Number(formData.CaseStatusID),
            } as any;

            console.log("Update payload:", payload);

            if (!id) return;
            await UpdateTherapyCase(Number(id), payload);

            const sid = Number(payload.case_status_id);
            const state = sid === 2 ? "completed" : sid === 1 ? "in_treatment" : "unknown";

            try {
                const bc = new BroadcastChannel("patient_activity");
                const msg = {
                    type: "therapy_status_change",
                    state, // "in_treatment" | "completed" | "unknown"
                    patient_id: Number(payload.patient_id),
                    psychologist_id: psychoIdNum, // ✅ ใช้ตัวนอก
                };
                bc.postMessage(msg);
                bc.close();

                // fallback (ให้แท็บอื่น/หน้า Homedoc ที่เปิดทีหลังรับได้)
                localStorage.setItem("patient_activity_ping", JSON.stringify({ ...msg, ts: Date.now() }));
            } catch {
                localStorage.setItem(
                    "patient_activity_ping",
                    JSON.stringify({
                        type: "therapy_status_change",
                        state,
                        patient_id: Number(payload.patient_id),
                        psychologist_id: psychoIdNum,
                        ts: Date.now(),
                    })
                );
            }
            setNotification({ message: `แก้ไขเคส "${formData.CaseTitle}" สำเร็จ`, success: true });
            setTimeout(() => {
                navigate("/psychologist/therapy");
            }, 1500);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBack = () => navigate(-1);

    return (
        <div className="!min-h-screen !bg-white !p-8">
            <div className="!max-w-4xl !mx-auto !flex !flex-col !items-center">
                <div className="!w-full !mb-8">
                    <div className="!flex !items-center !mb-6">
                        <button
                            onClick={handleBack}
                            className="!inline-flex !items-center !px-4 !py-2 !text-sm !font-medium !text-gray-600 !hover:!text-gray-900"
                        >
                            <ArrowLeft className="!h-5 !w-5 !mr-2" />
                            กลับ
                        </button>
                    </div>
                    <div className="!text-center">
                        <h1 className="!text-4xl !font-bold !text-gray-900 !mb-2">
                            แก้ไขเคสการบำบัด
                        </h1>
                        <p className="!text-gray-600 !text-lg">
                            ปรับปรุงข้อมูลการบำบัดและผู้รับผิดชอบ
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();  // ป้องกัน form submit ปกติ
                        setShowModal(true);  // เปิด modal
                    }}
                    className="!w-full !bg-white !border !border-gray-200 !rounded-lg !p-8 !space-y-8"
                >

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="CaseTitle"
                            className="!block !text-sm !font-medium !text-gray-700 !mb-2"
                        >
                            ชื่อเคสการบำบัด <span className="!text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="CaseTitle"
                            name="CaseTitle"
                            value={formData.CaseTitle}
                            onChange={handleInputChange}
                            className={`!block !w-full !px-4 !py-3 !border !rounded-lg ${errors.CaseTitle ? "!border-red-500" : "!border-gray-300"
                                }`}
                            placeholder="เช่น บำบัดความวิตกกังวล"
                        />
                        {errors.CaseTitle && (
                            <p className="!mt-1 !text-sm !text-red-600">
                                {errors.CaseTitle}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="CaseDescription"
                            className="!block !text-sm !font-medium !text-gray-700 !mb-2"
                        >
                            รายละเอียดการบำบัด <span className="!text-red-500">*</span>
                        </label>
                        <textarea
                            id="CaseDescription"
                            name="CaseDescription"
                            rows={4}
                            value={formData.CaseDescription}
                            onChange={handleInputChange}
                            className={`!block !w-full !px-4 !py-3 !border !rounded-lg ${errors.CaseDescription ? "!border-red-500" : "!border-gray-300"
                                }`}
                            placeholder="อธิบายรายละเอียดของอาการและแผนการบำบัด..."
                        />
                        {errors.CaseDescription && (
                            <p className="!mt-1 !text-sm !text-red-600">
                                {errors.CaseDescription}
                            </p>
                        )}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label
                            htmlFor="CaseStartDate"
                            className="!block !text-sm !font-medium !text-gray-700 !mb-2"
                        >
                            วันที่เริ่มการบำบัด <span className="!text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="CaseStartDate"
                            name="CaseStartDate"
                            value={formData.CaseStartDate}
                            onChange={handleInputChange}
                            className={`!block !w-full !px-4 !py-3 !border !rounded-lg ${errors.CaseStartDate ? "!border-red-500" : "!border-gray-300"
                                }`}
                        />
                        {errors.CaseStartDate && (
                            <p className="!mt-1 !text-sm !text-red-600">
                                {errors.CaseStartDate}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="CaseStatusID"
                            className="!block !text-sm !font-medium !text-gray-700 !mb-2"
                        >
                            สถานะการบำบัด
                        </label>
                        <select
                            id="CaseStatusID"
                            name="CaseStatusID"
                            value={formData.CaseStatusID}
                            onChange={handleInputChange}
                            className="!block !w-full !px-4 !py-3 !border !border-gray-300 !rounded-lg"
                        >
                            {casesStatus.map((status) => (
                                <option key={status.ID} value={status.ID}>
                                    {status.StatusName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="!flex !justify-center !space-x-4 !pt-6 !border-t !border-gray-200">
                        <button
                            type="submit"
                            className="!flex !items-center !justify-center !px-8 !py-3 !text-base !font-medium !text-white !bg-gray-900 !border !border-transparent !rounded-lg !hover:!bg-gray-800"
                        >
                            <Save className="!h-5 !w-5 !mr-2" />
                            บันทึกการแก้ไข
                        </button>
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={handleBack}
                            className="!w-208 !flex !items-center !justify-center !px-8 !py-3 !text-base !font-medium !text-gray-700 !bg-white !border !border-gray-300 !rounded-lg !hover:!bg-gray-50"
                        >
                            ยกเลิก
                        </button>
                    </div>
                </form>
            </div>
            {showModal && (
                <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center">
                    <div className="!bg-white !p-6 !rounded-lg !max-w-md !w-full !space-y-4">
                        <h2 className="!text-xl !font-bold">ยืนยันการแก้เคส</h2>
                        <p>คุณต้องการบันทึกเคส "{formData.CaseTitle}" ใช่หรือไม่?</p>
                        <div className="!flex !justify-end !gap-3">
                            <button onClick={() => setShowModal(false)} className="!px-4 !py-2 !bg-gray-200 !rounded">ยกเลิก</button>
                            <button onClick={() => { handleSubmit(); setShowModal(false); }} className="!px-4 !py-2 !bg-blue-600 !text-white !rounded">ยืนยัน</button>
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
    );
}
