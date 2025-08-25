export interface PatientTherapyInterface {
  ID: number;
  FirstName: string;
  LastName: string;
  Age: number; // เพิ่มฟิลด์อายุแบบกรอกเอง
  Gender: string;
  Address: string;
  DateOfBirth: string; // Format: YYYY-MM-DD
  Phone: string;
  Email: string;
  Password: string;
  ConsentAccepted: boolean;
}
