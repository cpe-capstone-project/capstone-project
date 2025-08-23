import axios from "axios";
import type { PatientInterface } from "../../interfaces/IPatient";

const apiUrl = import.meta.env.VITE_API_URL;

export function authHeaders() {
  const token = localStorage.getItem("token") || "";
  const type  = localStorage.getItem("token_type") || "Bearer";
  return {
    "Content-Type": "application/json",
    Authorization: `${type} ${token}`,
  };
}

async function GetPatient() {
  return await axios
    .get(`${apiUrl}/patient`, { headers: authHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPatientById(id: number) {
  return await axios
    .get(`${apiUrl}/patient/${id}`, { headers: authHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function UpdatePatientById(id: number, data: PatientInterface) {
  return await axios
    .patch(`${apiUrl}/patient/${id}`, data, { headers: authHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeletePatientById(id: number) {
  return await axios
    .delete(`${apiUrl}/patient/${id}`, { headers: authHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function CreatePatient(data: PatientInterface) {
  return await axios
    .post(`${apiUrl}/signup`, data, { headers: authHeaders() })
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
