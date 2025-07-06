import { DiaryContextProvider } from "../contexts/DiaryContext";
import PatientLayout from "../layout/FullLayout/PatientLayout";
import DiaryList from "../pages/diary_list/DiaryList";
import DiaryDetail from "../pages/diary_detail/DiaryDetail";
import RequireRole from "./RequireRole";
import Homepage from "../pages/homepage/homepage";

const PatientRoutes = {
  path: "/patient",
  element: (
    <RequireRole allowedRoles={["Patient"]}>
      <DiaryContextProvider>
        <PatientLayout />
      </DiaryContextProvider>
    </RequireRole>
  ),
  children: [  
    { path: "diary", element: <DiaryList /> },
    { path: "diary/detail/:id", element: <DiaryDetail /> },
  ],
};

export default PatientRoutes;