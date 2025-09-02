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

// ✅ GET /thought_records?sort=UpdatedAt&order=desc
async function GetThoughtRecords(
  sort: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
  order: "asc" | "desc" = "desc"
) {
  return await axios
    .get(`${apiUrl}/thought_records?sort=${sort}&order=${order}`, requestOptions) // แก้ตรงนี้ /thought_records (plural)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ GET /thought_record/latest?limit=5
async function GetLatestThoughtRecords(limit = 5) {
  return await axios
    .get(`${apiUrl}/thought_record/latest?limit=${limit}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ GET /thought_record/:id
async function GetThoughtRecordById(id: number) {
  return await axios
    .get(`${apiUrl}/thought_record/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ POST /thought_record
async function CreateThoughtRecord(data: ThoughtRecordInterface) {
  return await axios
    .post(`${apiUrl}/thought_record`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ PATCH /thought_record/:id
async function UpdateThoughtRecordById(id: number, data: ThoughtRecordInterface) {
  return await axios
    .patch(`${apiUrl}/thought_record/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ DELETE /thought_record/:id
async function DeleteThoughtRecordById(id: number) {
  return await axios
    .delete(`${apiUrl}/thought_record/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ GET /thought_record/therapycase/:id
async function GetThoughtRecordsByTherapyCaseID(id: number) {
  try {
    const res = await axios.get(`${apiUrl}/thoughtrecords/case/${id}`, requestOptions);
    return res.data;
  } catch (e: any) {
    // ถ้า axios มี response แสดง error จาก server ถ้าไม่มีให้แสดง error ทั่วไป
    return e.response || { error: e.message };
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
};
