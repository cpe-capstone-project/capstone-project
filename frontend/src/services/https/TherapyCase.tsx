import axios from "axios";
import type { TherapyCaseInterface } from "../../interfaces/ITherapyCase"
import type { DiaryInterface } from "../../interfaces/IDiary"
import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord"

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

export interface DiariesResponse {
  diaries: DiaryInterface[];
  written_today: boolean;
}

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// ✅ GET /thought_record/:id
async function GetTherapyCaseByPatientId(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/patient/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetTherapyCaseByPsychologisId(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/psyco/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetTherapyCaseByID(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPatientByPsycoId(id: number) {
  return await axios
    .get(`${apiUrl}/patientbypsycoID/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateTherapyCase(payload: TherapyCaseInterface) {
  try {
    const res = await axios.post(`${apiUrl}/therapy-case/create`, payload, requestOptions);
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
}

async function UpdateTherapyCase(id: number, payload: TherapyCaseInterface) {
  try {
    const res = await axios.patch(
      `${apiUrl}/therapy-case/update/${id}`,
      payload,
      requestOptions
    );
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
}

const DeleteTherapyCase = async (id: number) => {
  try {
    const token = localStorage.getItem("token"); // สมมติเก็บ JWT ไว้ใน localStorage
    const res = await axios.delete(`${apiUrl}/therapy-case/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
};

async function GetCaseStatuses() {
  return await axios
    .get(`${apiUrl}/therapy-case/status`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDiariesByTherapyCaseID(
  therapyCaseID: number
): Promise<DiariesResponse | null> {
  try {
    const token = localStorage.getItem("token"); 
    const res = await axios.get(`${apiUrl}/therapy-case/${therapyCaseID}/diaries`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching diaries:", error);
    return null;
  }
}

export interface ThoughtRecordResponse {
  thought_records: ThoughtRecordInterface[];
  written_today: boolean;
}

export async function GetThoughtRecordsByTherapyCaseID(
  therapyCaseID: number
): Promise<ThoughtRecordResponse | null> {
  try {
    const token = localStorage.getItem("token"); // ดึง JWT จาก localStorage
    const res = await axios.get(`${apiUrl}/therapy-case/${therapyCaseID}/thought-records`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching thought records:", error);
    return null;
  }
}




export {
  GetTherapyCaseByPatientId,
  GetTherapyCaseByPsychologisId,
  CreateTherapyCase,
  GetPatientByPsycoId,
  GetTherapyCaseByID,
  UpdateTherapyCase,
  DeleteTherapyCase,
  GetCaseStatuses,
  GetDiariesByTherapyCaseID,
};
