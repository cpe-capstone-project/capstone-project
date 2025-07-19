// src/layout/FullLayout/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/navbar/bunny";
import "./AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
