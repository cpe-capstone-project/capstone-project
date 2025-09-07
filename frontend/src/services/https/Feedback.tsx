import axios from "axios";
import type { FeedBackInterface } from "../../interfaces/IFeedback";
import type { FeedbackTimeInterface } from "../../interfaces/IFeedbackTime";

const apiUrl = import.meta.env.VITE_API_URL;

// ✅ อ่าน token สดทุกครั้ง (กันค่าเก่าค้าง)
const getRequestOptions = () => {
  const token = localStorage.getItem("token") || "";
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `${tokenType} ${token}`,
    },
  };
};

// ✅ POST /feedback/create
async function CreateFeedback(data: FeedBackInterface) {
  try {
    const res = await axios.post(`${apiUrl}/feedback/create`, data, getRequestOptions());
    // (ออปชั่น) แจ้ง event ว่ามี feedback ใหม่ เพื่อให้หน้าจออื่นรีโหลดเฉพาะไดอารี่ที่เกี่ยว
    const ids = Array.isArray((data as any).DiaryIDs)
      ? (data as any).DiaryIDs
      : (data as any).DiaryID ? [(data as any).DiaryID] : [];
    if (ids.length) {
      window.dispatchEvent(new CustomEvent("feedback:created", { detail: { diaryIDs: ids } }));
    }
    return res.data;
  } catch (e: any) {
    return e.response?.data || { error: "เกิดข้อผิดพลาด" };
  }
}

// ✅ GET /feedback-time
async function GetFeedbackTime(): Promise<FeedbackTimeInterface[]> {
  try {
    const res = await axios.get(`${apiUrl}/feedback-time`, getRequestOptions());
    return res.data;
  } catch (e: any) {
    console.error("Error fetching FeedbackTime:", e);
    return [];
  }
}


// ดึง Diary Feedback ของผู้ป่วย
 async function GetDiaryFeedback(patientId: number) {
  try {
    const res = await axios.get(`${apiUrl}/patient/feedback/diary/${patientId}`,getRequestOptions());
    return res.data;
  } catch (error) {
    console.error("Error fetching diary feedback:", error);
    return [];
  }
}
/* ----------------- เพิ่มฟังก์ชันดึงฟีดแบ็กตามไดอารี่ ----------------- */

// ✅ GET /diary/:diaryId/feedbacks?limit=3
//   → ปรับ path ให้ตรงกับ backend ของคุณถ้าต่างจากนี้
async function GetFeedbacksForDiary(diaryId: number, limit = 3, bustCache = false) {
  try {
    const url = `${apiUrl}/diary/${diaryId}/feedbacks?limit=${limit}${
      bustCache ? `&t=${Date.now()}` : ""
    }`;
    const res = await axios.get(url, getRequestOptions());
    // รองรับทั้ง {items: []} / {data: []} / [] ตรงๆ
    return (res?.data?.items ?? res?.data?.data ?? res?.data ?? []) as FeedBackInterface[];
  } catch (e: any) {
    console.error("GetFeedbacksForDiary error:", e);
    return [];
  }
}


// ดึง Thought Feedback ของผู้ป่วย
 async function GetThoughtFeedback(patientId: number) {
  try {
    const res = await axios.get(`${apiUrl}/patient/feedback/thought/${patientId}`,getRequestOptions());
    return res.data;
  } catch (error) {
    console.error("Error fetching thought feedback:", error);
    return [];
  }
}

// (ออปชั่น) ถ้าต้องการดึงหลายไดอารี่พร้อมกัน
async function GetFeedbacksByDiary(diaryId: number, limit = 3, noCache = false) {
  const bust = noCache ? `&nc=${Date.now()}` : "";
  const url = `${apiUrl}/diaries/${diaryId}/feedbacks?limit=${limit}${bust}`;
  return axios
    .get(url, getRequestOptions()) 
    .then((res) => res)
    .catch((e) => e.response);
}


// (ออปชั่น) ถ้าต้องการดูทั้งหมดของผู้ป่วย
// ✅ GET /patient/:patientId/feedbacks?limit=10
async function GetFeedbacksByPatient(patientId: number, limit = 10, bustCache = false) {
  try {
    const url = `${apiUrl}/patient/${patientId}/feedbacks?limit=${limit}${
      bustCache ? `&t=${Date.now()}` : ""
    }`;
    const res = await axios.get(url, getRequestOptions());
    return (res?.data?.items ?? res?.data?.data ?? res?.data ?? []) as FeedBackInterface[];
  } catch (e: any) {
    console.error("GetFeedbacksByPatient error:", e);
    return [];
  }
}


export { 
    CreateFeedback,
    GetFeedbackTime,
    GetDiaryFeedback,
    GetThoughtFeedback,
    GetFeedbacksForDiary,
    GetFeedbacksByDiary,   // (ออปชั่น)
    GetFeedbacksByPatient,
 };



