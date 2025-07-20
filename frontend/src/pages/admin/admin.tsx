import { useEffect, useState } from "react";
import axios from "axios"; // ต้องติดตั้ง axios: npm install axios
import "./admin.css";
import Swal from "sweetalert2";

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
const handleImageClick = (imgUrl: string) => {
  Swal.fire({
    title: "ไฟล์ใบรับรองแพทย์",
    imageUrl: imgUrl,
    imageWidth: 400,
    imageAlt: "Certificate Image",
    showCloseButton: true,
    showConfirmButton: false, // ❌ เอาปุ่ม "ปิด" ออก
    background: "#fff",
  });
};


const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<"Patient" | "Psychologist">("Patient");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [patientsRes, psychologistsRes] = await Promise.all([
         axios.get("http://localhost:8000/admin/patients"),
         axios.get("http://localhost:8000/admin/psychologists"),
        ]);

        const patients: User[] = patientsRes.data.map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
          age: p.age,
          gender: p.gender,
          birthday: p.birthday,
          role: "Patient",
        }));

        const psychologists: User[] = psychologistsRes.data.map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
          age: p.age,
          gender: p.gender,
          certificateNumber: p.certificate_number,
          certificateFile: p.certificate_file,
          role: "Psychologist",
        }));

        setUsers([...patients, ...psychologists]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const totalUsers = users.length;
  const patientCount = users.filter((u) => u.role === "Patient").length;
  const psychologistCount = users.filter((u) => u.role === "Psychologist").length;
  const filteredUsers = users.filter((u) => u.role === activeTab);

  return (
    <div className="adminxx-wrapper">
      <div className="adminxx-cards">
        {/* Total Users */}
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

        {/* Psychologists */}
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

        {/* Patients */}
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

        {/* Total Percent */}
        <div className="adminxx-card purple">
          <div className="card-left">
            <div className="card-icon-wrapper">
              <img src="https://cdn-icons-png.flaticon.com/128/10176/10176866.png" alt="icon" />
            </div>
            <p>เปอร์เซ็นต์รวม</p>
          </div>
          <div className="card-right">
            <h3>100%</h3>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <h2 className="adminxx-title">ข้อมูลผู้ใช้งาน</h2>
      <div className="adminxx-tabs">
        <button className={activeTab === "Patient" ? "active" : ""} onClick={() => setActiveTab("Patient")}>
          PATIENT
        </button>
        <button className={activeTab === "Psychologist" ? "active" : ""} onClick={() => setActiveTab("Psychologist")}>
          PSYCHOLOGY
        </button>
      </div>

      {/* Table */}
      <div className="adminxx-table">
        <table>
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>นามสกุล</th>
              <th>อีเมล</th>
              <th>อายุ</th>
              <th>เพศ</th>
              {activeTab === "Patient" ? <th>วันเกิด</th> : <>
                <th>เลขที่ใบรับรอง</th>
                <th>ไฟล์ใบรับรอง</th>
              </>}
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
  <img
    src={
      user.certificateFile?.startsWith("http")
        ? user.certificateFile
        : `http://localhost:8000/uploads/${user.certificateFile}`
    }
    alt="cert"
    className="adminxx-img"
    onClick={() =>
      handleImageClick(
        user.certificateFile?.startsWith("http")
          ? user.certificateFile
          : `http://localhost:8000/uploads/${user.certificateFile}`
      )
    }
    style={{ cursor: "pointer" }}
  />
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
