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

  const totalUsers = dummyUsers.length;
  const patientCount = dummyUsers.filter((u) => u.role === "Patient").length;
  const psychologistCount = dummyUsers.filter((u) => u.role === "Psychologist").length;

  const filteredUsers = dummyUsers.filter((user) => user.role === activeTab);

  return (
    <div className="adminxx-wrapper">
     <div className="adminxx-cards">
  <div className="adminxx-card turquoise">
    <div className="card-left">
      <div className="card-icon-wrapper">
        <img src="https://cdn-icons-png.flaticon.com/128/694/694642.png" alt="icon" />
      </div>
      <p>จำนวนผู้ใช้งาน</p>
    </div>
    <div className="card-right">
      <h3>{totalUsers} คน</h3>
      <span>100%</span>
    </div>
  </div>

  <div className="adminxx-card blue">
    <div className="card-left">
      <div className="card-icon-wrapper">
        <img src="https://cdn-icons-png.flaticon.com/128/2852/2852676.png" alt="icon" />
      </div>
      <p>จำนวนนักจิตวิทยา</p>
    </div>
    <div className="card-right">
      <h3>{psychologistCount} คน</h3>
      <span>{((psychologistCount / totalUsers) * 100).toFixed(2)}%</span>
    </div>
  </div>

  <div className="adminxx-card pink">
    <div className="card-left">
      <div className="card-icon-wrapper">
        <img src="https://cdn-icons-png.flaticon.com/128/3359/3359163.png" alt="icon" />
      </div>
      <p>จำนวนผู้ป่วย</p>
    </div>
    <div className="card-right">
      <h3>{patientCount} คน</h3>
      <span>{((patientCount / totalUsers) * 100).toFixed(2)}%</span>
    </div>
  </div>

  <div className="adminxx-card purple">
    <div className="card-left">
      <div className="card-icon-wrapper">
        <img src="https://cdn-icons-png.flaticon.com/128/10176/10176866.png" alt="icon" />
      </div>
      <p>เปอร์เซ็นต์รวม</p>
    </div>
    <div className="card-right">
      <h3>{((psychologistCount + patientCount) / totalUsers * 100).toFixed(2)}%</h3>
      <span>{((psychologistCount + patientCount) / totalUsers * 100).toFixed(2)}%</span>
    </div>
  </div>
</div>
      <h2 className="adminxx-title">ข้อมูลผู้ใช้งาน</h2>
      <div className="adminxx-tabs">
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
      <div className="adminxx-table">
        <table>
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>นามสกุล</th>
              <th>อีเมล</th>
              <th>อายุ</th>
              <th>เพศ</th>
              {activeTab === "Patient" ? (
                <th>วันเกิด</th>
              ) : (
                <>
                  <th>เลขที่ใบรับรอง</th>
                  <th>ไฟล์ใบรับรอง</th>
                </>
              )}
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
                  <button className="delete-btn">Delete Account</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
