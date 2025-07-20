// src/components/navbar/AdminSidebar.tsx
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });

    Toast.fire({
      icon: "success",
      title: "Log out successfully",
    });

    // ล้าง token หรือข้อมูล session ถ้ามี
    localStorage.removeItem("token");

    setTimeout(() => {
      navigate("/");
    }, 500);
  };

  return (
    <div className="admin-sidebar">
      <h2 className="admin-sidebar-title">Admin</h2>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><button onClick={handleLogout} >Logout</button></li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
