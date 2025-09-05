import axios from "axios"; 
import type { EmotionsInterface } from "../../interfaces/IEmotions";

const apiUrl = import.meta.env.VITE_API_URL;
const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

async function GetAllEmotions(): Promise<EmotionsInterface[] | { error: string }> {
  try {
    const res = await axios.get(`${apiUrl}/emotions`, requestOptions);
    return res.data;
  } catch (e: any) {
    return e.response?.data || { error: e.message };
  }
}

export { GetAllEmotions };
