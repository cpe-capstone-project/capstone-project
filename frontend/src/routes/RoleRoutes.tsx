import PatientRoutes from "./PatientRoutes";
import PsychologistRoutes from "./PsychologistRoutes";
import AdminRoutes from "./AdminRoutes";
import Unknown from "../pages/unknown/Unknown";
import SignInPages from "../pages/authentication/Login/SignIn";
import Register from "../pages/register/register";
import RoleHealth from "../pages/rolehealth/rolehealth";



const RoleRoutes = [
  { path: "/", element: <SignInPages /> },
  { path: "/signup", element: <Register /> },
  { path: "/register", element: <Register /> },
  { path: "/rolehealth", element: <RoleHealth /> },
  PatientRoutes,
  PsychologistRoutes,
  ...AdminRoutes, // ✅ ตอนนี้กระจายได้เลย
  { path: "*", element: <Unknown /> },
];



export default RoleRoutes;
