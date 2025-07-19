// AdminDashboard.tsx
import { useState } from "react";
import "./admin.css";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  gender: string;
  birthday?: string;
  certificateNumber?: string;
  certificateFile?: string;
  role: "Patient" | "Psychologist";
}
console.log("✅ Admin Dashboard Loaded");
const dummyUsers: User[] = [
  {
    id: 1,
    firstName: "หมอ",
    lastName: "หมอ",
    email: "pae@gmail.com",
    age: 15,
    gender: "ชาย",
    birthday: "22/09/2009",
    role: "Patient",
  },
  {
    id: 2,
    firstName: "ผู้ป่วย",
    lastName: "หมอ",
    email: "med@depression.rec.co.th",
    age: 46,
    gender: "หญิง",
    certificateNumber: "PsyRef123-123-1234",
    certificateFile: "https://via.placeholder.com/40",
    role: "Psychologist",
  },
  {
    id: 3,
    firstName: "ผู้ป่วย",
    lastName: "หมอ",
    email: "patient@gmail.com",
    age: 78,
    gender: "อื่นๆ",
    certificateNumber: "PsyRef123-123-1234",
    certificateFile: "https://via.placeholder.com/40",
    role: "Psychologist",
  },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"Patient" | "Psychologist">("Patient");

  const filteredUsers = dummyUsers.filter((user) => user.role === activeTab);

  return (
    <div className="adminxx-wrapper">
      <div className="adminxx-tab">
        <button
          className={activeTab === "Patient" ? "active" : ""}
          onClick={() => setActiveTab("Patient")}
        >
          PATIENT
        </button>
        <button
          className={activeTab === "Psychologist" ? "active" : ""}
          onClick={() => setActiveTab("Psychologist")}
        >
          PSYCHOLOGY
        </button>
      </div>

      <h2 className="adminxx-title">ข้อมูลผู้ใช้งาน</h2>

      <table className="adminxx-table">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>นามสกุล</th>
            <th>อีเมล</th>
            <th>อายุ</th>
            <th>เพศ</th>
            {activeTab === "Patient" ? <th>วันเกิด</th> : <><th>เลขที่ใบรับรอง</th><th>ไฟล์ใบรับรอง</th></>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>{user.gender}</td>
              {activeTab === "Patient" ? (
                <td>{user.birthday}</td>
              ) : (
                <>
                  <td>{user.certificateNumber}</td>
                  <td>
                    <img src={user.certificateFile} alt="cert" className="adminxx-img" />
                  </td>
                </>
              )}
              <td>
                <button className="adminxx-delete-btn">Delete Account</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;