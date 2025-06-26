import type { PatientInterface } from "../../interfaces/IPatient";

const apiUrl = "http://localhost:8000";

export async function CreatePatient(data: PatientInterface) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  try {
    const response = await fetch(`${apiUrl}/patients/register`, requestOptions);
    const data = await response.json();
    return {
      status: response.ok,
      message: response.ok ? data.message : data.error,
    };
  } catch (error) {
    return {
      status: false,
      message: "An error occurred",
    };
  }
}

export async function LoginPatient(email: string, password: string) {
  const isDepressionEmail = email.endsWith("@depressionrec.go.th");
  const endpoint = isDepressionEmail ? "/psychologists/login" : "/patients/login";

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  };

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, requestOptions);
    const data = await response.json();
    return {
      status: response.ok,
      message: data.message,
      userType: data.userType || null,
      profileName: data.profileName || "",
      imagePath: data.imagePath || "",
    };
  } catch (error) {
    return {
      status: false,
      message: "Server error",
    };
  }
}
