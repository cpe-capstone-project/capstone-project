import axios from "axios";
import type { DiarySummaryInterface } from "../../interfaces/IDiarySummary";

const apiUrl = import.meta.env.VITE_API_URL;

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

async function GetDiariesByPatientAndTherapyCase(
  patientId: number | string,
  therapyCaseId: number | string,
  sort: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
  order: "asc" | "desc" = "desc"
) {
  return await axios
    .get(
      `${apiUrl}/diaries/patient/${patientId}/therapy-case/${therapyCaseId}?sort=${sort}&order=${order}`,
      requestOptions
    )
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

async function GetDiarySummaryEmotionStatsById(id: number) {
  return await axios
    .get(`${apiUrl}/diary-summary-emotion-stats/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetDiaryCountThisMonth(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1; // 1-12

  return await axios
    .get(`${apiUrl}/diaries/count?year=${y}&month=${m}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
async function GetHomeDiaries(tz = "Asia/Bangkok") {
  return await axios
    .get(`${apiUrl}/diaries/home?tz=${encodeURIComponent(tz)}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
// GET /patients/:patientId/diaries/count?scope=month&tz=Asia/Bangkok&year=YYYY&month=M
async function GetDiaryCountForPatient(opts: {
  patientId: number;
  scope?: "day" | "week" | "month";
  tz?: string;
  year?: number;
  month?: number;
}) {
  const { patientId, scope = "month", tz = "Asia/Bangkok", year, month } = opts;

  const qs = new URLSearchParams({ scope, tz });
  if (year) qs.set("year", String(year));
  if (month) qs.set("month", String(month));

  return await axios.get(
    `${apiUrl}/patients/${patientId}/diaries/count?${qs.toString()}`,
    requestOptions
  );
}

// GET /patients/:patientId/diaries/home?tz=Asia/Bangkok
async function GetHomeDiariesForPatient(patientId: number, tz = "Asia/Bangkok") {
  return await axios.get(
    `${apiUrl}/patients/${patientId}/diaries/home?tz=${encodeURIComponent(tz)}`,
    requestOptions
  );
}


export {
  GetDiary,
  GetDiariesByPatientAndTherapyCase,
  GetDiaryById,
  GetLatestDiaries,
  UpdateDiaryById,
  DeleteDiaryById,
  CreateDiary,
  CreateDiarySummary,
  GetDiarySummaryById,
  GetDiarySummaryEmotionStatsById,
  GetDiaryCountThisMonth,
  GetHomeDiaries,
  GetDiaryCountForPatient,
  GetHomeDiariesForPatient,
};
