import RequireRole from "./RequireRole";

const AdminRoutes = {
  path: "/admin",
  element: (
    <RequireRole allowedRoles={["Admin"]}>
      <div>Admin Layout</div>
    </RequireRole>
  ),
  children: [
    { path: "dashboard", element: <div>Admin Dashboard</div> },
    // เพิ่ม route อื่นๆ ได้
  ],
};

export default AdminRoutes;