import axios from "axios";
import type { DiaryInterface } from "../../interfaces/IDiary";

const apiUrl = import.meta.env.VITE_API_URL

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");


const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetDiary() {
  return await axios
    .get(`${apiUrl}/diaries`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetDiaryById(id: number) {
  return await axios
    .get(`${apiUrl}/diary/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function UpdateDiaryById(id: number, data: DiaryInterface) {
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


async function CreateDiary(data: DiaryInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetDiary,
  GetDiaryById,
  UpdateDiaryById,
  DeleteDiaryById,
  CreateDiary,
};