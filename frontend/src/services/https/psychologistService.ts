import type { PsychologistInterface } from "../../interfaces/IPsychologist";

const apiUrl = "http://localhost:8000";

export async function CreatePsychologistWithFile(data: PsychologistInterface, file: File | null) {
  const formData = new FormData();

  // เพิ่มข้อมูล text ลงใน FormData
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
  }

  // เพิ่มไฟล์ ถ้ามี
  if (file) {
    formData.append("licenseImage", file);
  }

  try {
    const response = await fetch(`${apiUrl}/psychologists/register`, {
      method: "POST",
      body: formData,  // ใช้ FormData ส่ง
      // ห้ามตั้ง headers Content-Type เอง
    });

    const resData = await response.json();
    return {
      status: response.ok,
      message: response.ok ? resData.message : resData.error,
    };
  } catch (error) {
    return {
      status: false,
      message: "An error occurred",
    };
  }
}

