import { lazy } from "react";
import type { RouteObject } from "react-router";
import PatientLayout from "../layout/FullLayout/PatientLayout";
// import PatientHomePage from "../pages/home/PatientHomePage";
import Loadable from "../components/third-patry/Loadable";
import DiaryDetail from "../pages/diary_detail/DiaryDetail";
import { DiaryContextProvider } from "../contexts/DiaryContext";
import Unknown from "../pages/ีunknown/Unknown";

const SignIn = Loadable(lazy(() => import("../pages/authentication/Login/SignIn")));
const DiaryList = Loadable(lazy(() => import("../pages/diary_list/DiaryList")));


// สร้าง role-based map
const roleRouteMap = new Map<string, RouteObject>([
 [
    "Patient",
    {
      path: "/patient",
      element: <DiaryContextProvider><PatientLayout /></DiaryContextProvider>,
      children: [
        {
          path: "diary",
          element: <DiaryList />
        },
        {
          path: "diary/detail/:id",
          element: <DiaryDetail />
        },
      ]
    }
  ],
  [
    "Psychologist",
    {
      path: "/psychologist",
      element: <div>asd</div>,
      children: [
        { path: "diary", element: <DiaryList /> }
      ]
    }
  ],
  [
    "Unknown",
    {
      path: "/Unknown",
      element: <Unknown/>,
    }
  ],
  // [
  //   "Admin",
  //   {
  //     path: "/admin",
  //     element: <AdminHomePage />,
  //     children: [
  //       { path: "dashboard", element: <div>Admin Dashboard</div> }
  //     ]
  //   }
  // ]
]);

const AdminRoutes = (): RouteObject => {
  const role = localStorage.getItem("role");
  const currentPath = window.location.pathname;
  
  // ตรวจสอบว่ามีบทบาทใน Map หรือไม่
  if (role && roleRouteMap.has(role) && currentPath !== "/") {
    return roleRouteMap.get(role)!; // ! คือ non-null assertion
  }
  
  // ถ้าไม่มีบทบาทหรือบทบาทไม่รู้จัก -> กลับไปหน้า SignIn
  return {
    path: "/",
    element: <SignIn />
  };
};

export default AdminRoutes;