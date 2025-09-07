import axios from "axios";
import type { SituationTagInterface } from "../../interfaces/ISituationTag";

const apiUrl = import.meta.env.VITE_API_URL;

const Authorization = localStorage.getItem("token");
const Bearer = localStorage.getItem("token_type");

const requestOptions = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  },
};

// GET /situation-tags
export async function GetSituationTags(): Promise<SituationTagInterface[]> {
  try {
    const res = await axios.get<SituationTagInterface[]>(`${apiUrl}/situation-tags`, requestOptions);
    return res.data;
  } catch (e: any) {
    console.error("Error fetching situation tags:", e);
    return [];
  }
}

// POST /situation-tags
export async function CreateSituationTag(data: Partial<SituationTagInterface>): Promise<SituationTagInterface | null> {
  try {
    const res = await axios.post<SituationTagInterface>(`${apiUrl}/situation-tags`, data, requestOptions);
    return res.data;
  } catch (e: any) {
    console.error("Error creating situation tag:", e);
    return null;
  }
}

// DELETE /situation-tags/:id
export async function DeleteSituationTag(id: number): Promise<{ message?: string } | null> {
  try {
    const res = await axios.delete<{ message: string }>(`${apiUrl}/situation-tags/${id}`, requestOptions);
    return res.data;
  } catch (e: any) {
    console.error("Error deleting situation tag:", e);
    return null;
  }
}
