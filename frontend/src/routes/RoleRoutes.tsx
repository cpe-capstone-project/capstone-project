import PatientRoutes from "./PatientRoutes";
import PsychologistRoutes from "./PsychologistRoutes";
import AdminRoutes from "./AdminRoutes";
import Unknown from "../pages/unknown/Unknown";
import SignInPages from "../pages/authentication/Login/SignIn";
import Register from "../pages/register/register";

const RoleRoutes = [
  {
    path: "/",
    element: <SignInPages />,
  },
  {
    path: "/signup",
    element: <Register />,
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
