import type { AdminInterface } from "../../interfaces/IAdmin";
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

// ✅ GET: Admin ทั้งหมด
async function GetAdmins() {
  return await axios
    .get(`${apiUrl}/admins`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ GET: Admin ตาม ID
async function GetAdminById(id: number) {
  return await axios
    .get(`${apiUrl}/admins/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ PATCH: อัปเดต Admin
async function UpdateAdminById(id: number, data: AdminInterface) {
  return await axios
    .patch(`${apiUrl}/admins/${id}`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ DELETE: ลบ Admin
async function DeleteAdminById(id: number) {
  return await axios
    .delete(`${apiUrl}/admins/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

// ✅ POST: สมัคร Admin (ถ้ามีระบบสมัคร admin)
async function CreateAdmin(data: AdminInterface) {
  return await axios
    .post(`${apiUrl}/admins/register`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetAdmins,
  GetAdminById,
  UpdateAdminById,
  DeleteAdminById,
  CreateAdmin,
};
