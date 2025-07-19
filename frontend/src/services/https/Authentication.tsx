import axios from "axios";
import type { SignInInterface } from "../../interfaces/SignIn";

const apiUrl = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const type = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    Authorization: `${type} ${token}`,
  };
};

async function SignIn(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/signin`, data, { headers: getAuthHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function SignInPsychologist(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/psychologists/signin`, data, { headers: getAuthHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}
async function SignInAdmin(data: SignInInterface) {
  return await axios
    .post(`${apiUrl}/admin/signin`, data, { headers: getAuthHeaders()} )
    .then((res) => res)
    .catch((e) => e.response);
}

export {
  SignIn,
  SignInPsychologist,
  SignInAdmin, 
};
