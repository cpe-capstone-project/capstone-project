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

// ✅ GET /thought_record/:id
async function GetTherapyCaseByPatientId(id: number) {
  return await axios
    .get(`${apiUrl}/therapy-case/patient/${id}`, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  GetTherapyCaseByPatientId,
};
