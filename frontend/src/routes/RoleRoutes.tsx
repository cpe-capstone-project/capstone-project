import PatientRoutes from "./PatientRoutes";
import PsychologistRoutes from "./PsychologistRoutes";
import AdminRoutes from "./AdminRoutes";
import Unknown from "../pages/unknown/Unknown";
import SignInPages from "../pages/authentication/Login/SignIn";
import Register from "../pages/register/register";
import RoleHealth from "../pages/rolehealth/rolehealth";


const RoleRoutes = [
  {
    path: "/",
    element: <SignInPages />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
  {
    path: "/register", // ✅ สำหรับลงทะเบียนผู้ป่วย
    element: <Register />,
  },
  {
    path: "/rolehealth", // ✅ สำหรับนักจิตวิทยา
    element: <RoleHealth />,
  },
  PatientRoutes,
  PsychologistRoutes,
  AdminRoutes,
  {
    path: "*",
    element: <Unknown />,
  },
];

export default RoleRoutes;
