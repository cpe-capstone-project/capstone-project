import type { PatientInterface } from "../../interfaces/IPatient";

import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");


const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetPatient() {
  return await axios
    .get(`${apiUrl}/patient`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function GetPatientById(id: number) {
  return await axios
    .get(`${apiUrl}/patient/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function UpdatePatientById(id: number, data: PatientInterface) {
  return await axios
    .patch(`${apiUrl}/patient/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function DeletePatientById(id: number) {
  return await axios
    .delete(`${apiUrl}/patient/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}


async function CreatePatient(data: PatientInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetPatient,
  GetPatientById,
  UpdatePatientById,
  DeletePatientById,
  CreatePatient,
};