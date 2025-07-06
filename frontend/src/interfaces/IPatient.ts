export interface PatientInterface {
  first_name: string;
  last_name: string;
  age: number; // เพิ่มฟิลด์อายุแบบกรอกเอง
  gender: string;
  address: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  phone: string;
  email: string;
  password: string;
  consent_accepted: boolean;
}
