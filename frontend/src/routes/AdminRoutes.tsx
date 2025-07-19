import RequireRole from "./RequireRole";
import AdminLayout from "../layout/FullLayout/AdminLayout";
import AdminDashboard from "../pages/admin/admin";

const AdminRoutes = {
  path: "/admin",
  element: (
    <RequireRole allowedRoles={["Admin"]}>
      <AdminLayout />
    </RequireRole>
  ),
  children: [
    { path: "dashboard", element: <AdminDashboard /> },
  ],
};

export default AdminRoutes;
