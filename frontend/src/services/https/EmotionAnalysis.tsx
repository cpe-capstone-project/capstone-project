import axios from "axios";
import type { IEmotionAnalysisResults } from "../../interfaces/IEmotionAnalysisResults";

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// POST /emotion-analysis
async function CreateEmotionAnalysis(data: IEmotionAnalysisResults) {
  return await axios
    .post(`${apiUrl}/emotion-analysis`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /emotion-analysis
async function GetAllEmotionAnalysis() {
  return await axios
    .get(`${apiUrl}/emotion-analysis`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
// GET /emotion-analysis
async function GetAllEmotions() {
  return await axios
    .get(`${apiUrl}/emotion`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /emotion-analysis/:id
async function GetEmotionAnalysisById(id: number) {
  return await axios
    .get(`${apiUrl}/emotion-analysis/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// PATCH /emotion-analysis/:id
async function UpdateEmotionAnalysis(id: number, data: IEmotionAnalysisResults) {
  return await axios
    .patch(`${apiUrl}/emotion-analysis/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// DELETE /emotion-analysis/:id
async function DeleteEmotionAnalysis(id: number) {
  return await axios
    .delete(`${apiUrl}/emotion-analysis/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// DELETE /delall-emotion-analysis/:id
async function DeleteEmotionAnalysisByPatientID(patientId: number) {
  return await axios
    .delete(`${apiUrl}/delall-emotion-analysis/${patientId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /patientslist/dashboard_by_psychologist_id/:id
async function GetPatientsDashboardByPsychologistId(id: number) {
  return await axios
    .get(`${apiUrl}/patientslist/dashboard_by_psychologist_id/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /patientslist/dashboard/:id - ดึงข้อมูลพื้นฐานของผู้ป่วยคนเดียว
async function GetPatientDashboardByID(patientId: number | string) {
  return await axios
    .get(`${apiUrl}/patientslist/dashboard/${patientId}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
// GET /emotion/detailsdashboard_1/:id/:mode/:date
async function GetDashboardDetails_1ByID(id: number, mode: number, date: string) {
  return await axios
    .get(`${apiUrl}/emotion/detailsdashboard_1/${id}/${mode}/${date}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /emotion/detailsdashboard_2/:id/:stardate/:enddate
async function GetEmotionDetailsDashBoardByIDAndTime(id: number, startDate: string, endDate: string) {
  return await axios
    .get(`${apiUrl}/emotion/detailsdashboard_2/${id}/${startDate}/${endDate}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /emotion/detailsdashboard_3/:id/:stardate/:enddate
async function GetEmotionDetailsPrimaryEmoDashBoardByIDandTime(id: number, startDate: string, endDate: string) {
  return await axios
    .get(`${apiUrl}/emotion/detailsdashboard_3/${id}/${startDate}/${endDate}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET /emotion/detailsdashboard_4/:id/:stardate/:enddate
async function GetEmotionDetailsSubWeekDashBoardByIDandTime(id: number, startDate: string, endDate: string) {
  return await axios
    .get(`${apiUrl}/emotion/detailsdashboard_4/${id}/${startDate}/${endDate}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
// POST /emotion-analysis-create-diary/:id - Create emotion analysis from diary (Complete Flow)
async function CreateEmotionAnalysisFromDiary(diaryId: number) {
  return await axios
    .post(`${apiUrl}/emotion-analysis-create-diary/${diaryId}`, {}, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// POST /emotion-analysis-create-thoughtrecord/:id - Create emotion analysis from thought record (Complete Flow)
async function CreateEmotionAnalysisFromThoughtRecord(thoughtRecordId: number) {
  return await axios
    .post(`${apiUrl}/emotion-analysis-create-thoughtrecord/${thoughtRecordId}`, {}, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}
export {
  CreateEmotionAnalysis,
  GetAllEmotionAnalysis,
  GetAllEmotions,
  GetEmotionAnalysisById,
  UpdateEmotionAnalysis, 
  DeleteEmotionAnalysis,
  DeleteEmotionAnalysisByPatientID,
  GetPatientsDashboardByPsychologistId,
  GetPatientDashboardByID,
  GetDashboardDetails_1ByID,
  GetEmotionDetailsDashBoardByIDAndTime,
  GetEmotionDetailsPrimaryEmoDashBoardByIDandTime,
  GetEmotionDetailsSubWeekDashBoardByIDandTime,
  CreateEmotionAnalysisFromDiary,
  CreateEmotionAnalysisFromThoughtRecord,
};