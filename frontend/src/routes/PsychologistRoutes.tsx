import RequireRole from "./RequireRole";
import DiaryList from "../pages/diary_list/DiaryList";
import Homedoc from "../pages/homedoc/homedoc";
import PsychoLayout from "../layout/FullLayout/PsychoLayout";

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
  ],
};

export default PsychologistRoutes;
