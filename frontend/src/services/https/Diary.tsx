import axios from "axios";
import type { DiarySummaryInterface } from "../../interfaces/IDiarySummary";

const apiUrl = import.meta.env.VITE_API_URL

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");


const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetDiary(
  sort: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
  order: "asc" | "desc" = "desc"
) {
  return await axios
    .get(`${apiUrl}/diaries?sort=${sort}&order=${order}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDiaryById(id: number) {
  return await axios
    .get(`${apiUrl}/diary/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetLatestDiaries(limit = 5) {
  return await axios
    .get(`${apiUrl}/diaries/latest?limit=${limit}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdateDiaryById(id: number, data: DiarySummaryInterface) {
  return await axios
    .patch(`${apiUrl}/diary/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeleteDiaryById(id: number) {
  return await axios
    .delete(`${apiUrl}/diary/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreateDiary(data: DiarySummaryInterface) {
  return await axios
    .post(`${apiUrl}/diary`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreateDiarySummary(data: unknown) {
  return await axios
    .post(`${apiUrl}/diary-summary`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDiarySummaryById(id: number) {
  return await axios
    .get(`${apiUrl}/diary-summary/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetDiary,
  GetDiaryById,
  GetLatestDiaries,
  UpdateDiaryById,
  DeleteDiaryById,
  CreateDiary,
  CreateDiarySummary,
  GetDiarySummaryById,
};