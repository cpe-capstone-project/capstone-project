import type { PsychologistInterface } from "../../interfaces/IPsychologist";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// GET: รายชื่อจิตแพทย์ทั้งหมด
async function GetPsychologists() {
  return await axios
    .get(`${apiUrl}/psychologists`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// GET: จิตแพทย์ตาม ID
async function GetPsychologistById(id: number) {
  return await axios
    .get(`${apiUrl}/psychologists/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// PATCH: อัปเดตจิตแพทย์
async function UpdatePsychologistById(id: number, data: PsychologistInterface) {
  return await axios
    .patch(`${apiUrl}/psychologists/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// DELETE: ลบจิตแพทย์
async function DeletePsychologistById(id: number) {
  return await axios
    .delete(`${apiUrl}/psychologists/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// POST: สมัครสมาชิก (Register)
async function CreatePsychologist(data: PsychologistInterface) {
  return await axios
    .post(`${apiUrl}/psychologists/register`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetPsychologists,
  GetPsychologistById,
  UpdatePsychologistById,
  DeletePsychologistById,
  CreatePsychologist,
};
