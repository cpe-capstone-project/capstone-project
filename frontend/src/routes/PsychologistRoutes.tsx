import RequireRole from "./RequireRole";
import DiaryList from "../pages/diary_list/DiaryList";
import Homedoc from "../pages/homedoc/homedoc";
import PsychoLayout from "../layout/FullLayout/PsychoLayout";
import  Therapy from "../pages/therapy/therapy";
import TherapyCreate from "../pages/therapy/therapyCreate"
import TherapyUpdate from "../pages/therapy/therapyUpdate"
import TherapyDetail from "../pages/therapy/therapyDetail"

const PsychologistRoutes = {
  path: "/psychologist",
  element: (
    <RequireRole allowedRoles={["Psychologist"]}>
      <PsychoLayout />
    </RequireRole>
  ),
  children: [
    { path: "homedoc", element: <Homedoc /> },
    { path: "diary", element: <DiaryList /> },
    { path: "therapy", element: <Therapy /> },
    { path: "therapyCreate", element: <TherapyCreate /> },
    { path: "therapyUpdate/:id", element: <TherapyUpdate /> },
    { path: "therapyDetail/:id", element: <TherapyDetail /> },
  ],
};

export default PsychologistRoutes;
