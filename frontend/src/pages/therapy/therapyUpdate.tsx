import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import {
    GetTherapyCaseByID,
    UpdateTherapyCase,
    GetPatientByPsycoId,
    GetCaseStatuses,
} from "../../services/https/TherapyCase";
import type { TherapyInterface } from "../../interfaces/ITherapy";
import type { PatientTherapyInterface } from "../../interfaces/IPatientTherapy";
import type { CaseStatusInterface } from "../../interfaces/ICaseStatus";


export default function EditTherapyCasePage() {
    const navigate = useNavigate();
    const { id } = useParams(); // รับ id จาก path
    const psychoIdStr = localStorage.getItem("id");
    const [casesStatus, setCasesStatus] = useState<CaseStatusInterface[]>([]);
    console.log("casesStatus",casesStatus)

    const [formData, setFormData] = useState<TherapyInterface>({
        CaseTitle: "",
        CaseDescription: "",
        CaseStartDate: "",
        CaseStatusID: 1,
        PsychologistID: 0,
        PatientID: 0,
    });

    const [patient, setPatient] = useState<PatientTherapyInterface[]>([]);
    type FormErrors = Partial<Record<keyof TherapyInterface, string>>;
    const [errors, setErrors] = useState<FormErrors>({});

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



    // โหลดรายชื่อผู้ป่วย
    // โหลดรายชื่อผู้ป่วย
    useEffect(() => {
        if (!psychoIdStr) return;

        GetPatientByPsycoId(Number(psychoIdStr))
            .then((res) => {
                const data = res.data;

                if (Array.isArray(data)) {
                    setPatient(data);
                } else if (data) {
                    setPatient([data]); // แปลง object เดียวเป็น array
                } else {
                    setPatient([]);
                }
            })
            .catch((err) => {
                console.error("Error fetching patients:", err);
                setPatient([]);
            });
    }, [psychoIdStr]);


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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
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

            alert("แก้ไขข้อมูลเรียบร้อยแล้ว");
            navigate("/psychologist/therapy");
        } catch (error) {
            console.error(error);
            alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
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
                    onSubmit={handleSubmit}
                    className="!w-full !bg-white !border !border-gray-200 !rounded-lg !p-8 !space-y-8"
                >
                    {/* Patient */}
                    <div>
                        <label
                            htmlFor="PatientID"
                            className="!block !text-sm !font-medium !text-gray-700 !mb-2"
                        >
                            ผู้ป่วย <span className="!text-red-500">*</span>
                        </label>
                        <select
                            id="PatientID"
                            name="PatientID"
                            value={formData.PatientID}
                            onChange={handleInputChange}
                            className={`!block !w-full !px-4 !py-3 !border !rounded-lg ${errors.PatientID ? "!border-red-500" : "!border-gray-300"
                                }`}
                        >
                            <option value="">เลือกผู้ป่วย</option>
                            {patient.map((p) => (
                                <option key={p.ID} value={p.ID}>
                                    {p.FirstName}
                                </option>
                            ))}
                        </select>
                        {errors.PatientID && (
                            <p className="!mt-1 !text-sm !text-red-600">
                                {errors.PatientID}
                            </p>
                        )}
                    </div>

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
        </div>
    );
}
