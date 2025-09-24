import axios from "axios";
import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord";

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

interface ThoughtRecordFilter {
  date?: string;   // yyyy-mm-dd
  week?: string;   // yyyy-mm-dd
  month?: string;  // yyyy-mm
  year?: string;   // yyyy
}

async function GetThoughtRecords(
  patientId: number,
  therapyCaseId: number,
  sort: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
  order: "asc" | "desc" = "desc",
  filter?: ThoughtRecordFilter
) {
  try {
    // รวม params
    const params: Record<string, string> = {
      sort,
      order,
      ...filter, // date/week/month/year
    };

    const res = await axios.get(
      `${apiUrl}/thought_record/patient/${patientId}/therapy-case/${therapyCaseId}`,
      {
        ...requestOptions,
        params,
      }
    );
    return res.data; // ✅ ส่งข้อมูลตรง ๆ ไม่ต้อง return response ทั้งหมด
  } catch (e: any) {
    return e.response || { error: e.message };
  }
}

// ✅ GET /thought_record/latest?limit=5
async function GetLatestThoughtRecords(limit = 5) {
  try {
    const res = await axios.get(`${apiUrl}/thought_record/latest`, {
      ...requestOptions,
      params: { limit },
    });
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ GET /thought_record/:id
async function GetThoughtRecordById(id: number) {
  try {
    const res = await axios.get(`${apiUrl}/thought_record/${id}`, requestOptions);
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ POST /thought_record
async function CreateThoughtRecord(data: ThoughtRecordInterface) {
  try {
    const res = await axios.post(`${apiUrl}/thought_record`, data, requestOptions);
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ PATCH /thought_record/:id
async function UpdateThoughtRecordById(id: number, data: ThoughtRecordInterface) {
  try {
    const res = await axios.patch(`${apiUrl}/thought_record/${id}`, data, requestOptions);
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ DELETE /thought_record/:id
async function DeleteThoughtRecordById(id: number) {
  try {
    const res = await axios.delete(`${apiUrl}/thought_record/${id}`, requestOptions);
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ GET /thoughtrecords/case/:id
async function GetThoughtRecordsByTherapyCaseID(id: number) {
  try {
    const res = await axios.get(`${apiUrl}/thoughtrecords/case/${id}`, requestOptions);
    return res.data;
  } catch (e: any) {
    return e.response || { error: e.message };
  }
}

// ✅ GET /patients/:patientId/thought-records?limit=1
async function GetThoughtRecordsByPatientId(patientId: number, limit = 1, nocache = false) {
  try {
    const params: any = { limit };
    if (nocache) params._ = Date.now();
    const res = await axios.get(`${apiUrl}/patients/${patientId}/thought-records`, {
      ...requestOptions,
      params,
    });
    return res;
  } catch (e: any) {
    return e.response;
  }
}

// ✅ GET /patients/:patientId/thought-records/count
async function GetThoughtRecordCountByPatientId(patientId: number, nocache = false) {
  try {
    const params: any = {};
    if (nocache) params._ = Date.now();
    const res = await axios.get(`${apiUrl}/patients/${patientId}/thought-records/count`, {
      ...requestOptions,
      params,
    });
    return res;
  } catch (e: any) {
    return e.response;
  }
}

export {
  GetThoughtRecords,
  GetLatestThoughtRecords,
  GetThoughtRecordById,
  CreateThoughtRecord,
  UpdateThoughtRecordById,
  DeleteThoughtRecordById,
  GetThoughtRecordsByTherapyCaseID,
  GetThoughtRecordsByPatientId,
  GetThoughtRecordCountByPatientId,
};
