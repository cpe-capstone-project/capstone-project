import axios from "axios";
import type {TherapyCaseInterface} from "../../interfaces/ITherapyCase"

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// ✅ GET /thought_record/:id
async function GetTherapyCaseByPatientId(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/patient/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetTherapyCaseByPsychologisId(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/psyco/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetTherapyCaseByID(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

async function GetPatientByPsycoId(id: number) {
  return await axios
    .get(`${apiUrl}/patientbypsycoID/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

 async function CreateTherapyCase(payload: TherapyCaseInterface) {
  try {
    const res = await axios.post(`${apiUrl}/therapy-case/create`, payload, requestOptions);
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
}

async function UpdateTherapyCase(id: number, payload: TherapyCaseInterface) {
  try {
    const res = await axios.patch(
      `${apiUrl}/therapy-case/update/${id}`, 
      payload, 
      requestOptions
    );
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
}

const DeleteTherapyCase = async (id: number) => {
  try {
    const token = localStorage.getItem("token"); // สมมติเก็บ JWT ไว้ใน localStorage
    const res = await axios.delete(`${apiUrl}/therapy-case/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ API Success:", res.data);
    return res.data;
  } catch (e: any) {
    console.error("❌ API Error:", e.response?.data || e.message);
    throw e;
  }
};




export {
  GetTherapyCaseByPatientId,
  GetTherapyCaseByPsychologisId,
  CreateTherapyCase,
  GetPatientByPsycoId,
  GetTherapyCaseByID,
  UpdateTherapyCase,
  DeleteTherapyCase,
};
