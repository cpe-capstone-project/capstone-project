import axios from "axios";
import type { FeedBackInterface } from "../../interfaces/IFeedback"
import type { FeedbackTimeInterface } from "../../interfaces/IFeedbackTime"

const apiUrl = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token");
const tokenType = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${tokenType} ${token}`,
  },
};

// ✅ POST /feedback/create
async function CreateFeedback(data: FeedBackInterface) {
  try {
    const res = await axios.post(`${apiUrl}/feedback/create`, data, requestOptions);
    return res.data;
  } catch (e: any) {
    return e.response?.data || { error: "เกิดข้อผิดพลาด" };
  }
}

async function GetFeedbackTime(): Promise<FeedbackTimeInterface[]> {
  try {
    const res = await axios.get(`${apiUrl}/feedback-time`, requestOptions);
    return res.data;
  } catch (e: any) {
    console.error("Error fetching FeedbackTime:", e);
    return [];
  }
}

// ดึง Diary Feedback ของผู้ป่วย
 async function GetDiaryFeedback(patientId: number) {
  try {
    const res = await axios.get(`${apiUrl}/patient/feedback/diary/${patientId}`,requestOptions);
    return res.data;
  } catch (error) {
    console.error("Error fetching diary feedback:", error);
    return [];
  }
}

// ดึง Thought Feedback ของผู้ป่วย
 async function GetThoughtFeedback(patientId: number) {
  try {
    const res = await axios.get(`${apiUrl}/patient/feedback/thought/${patientId}`,requestOptions);
    return res.data;
  } catch (error) {
    console.error("Error fetching thought feedback:", error);
    return [];
  }
}

export { 
    CreateFeedback,
    GetFeedbackTime,
    GetDiaryFeedback,
    GetThoughtFeedback
 };
