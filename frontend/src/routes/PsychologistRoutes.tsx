import RequireRole from "./RequireRole";
import DiaryList from "../pages/diary_list/DiaryList";
import Homedoc from "../pages/homedoc/homedoc"; 
const PsychologistRoutes = {
  path: "/psychologist",
  element: (
    <RequireRole allowedRoles={["Psychologist"]}>
      <div>Psychologist Layout</div>
    </RequireRole>
  ),
  children: [
    { path: "homedoc", element: <Homedoc /> },
    { path: "diary", element: <DiaryList /> },
    
    // เพิ่ม route อื่นๆ ได้
  ],
};

export default PsychologistRoutes;