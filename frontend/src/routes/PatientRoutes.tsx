import { DiaryContextProvider } from "../contexts/DiaryContext";
import PatientLayout from "../layout/FullLayout/PatientLayout";
import DiaryList from "../pages/diary_list/DiaryList";
import DiaryDetail from "../pages/diary_detail/DiaryDetail";
import RequireRole from "./RequireRole";
import DiarySummary from "../pages/diary_summary/DiarySummary";
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
    { path: "home", element: <Homepage /> },
    { path: "diary", element: <DiaryList /> },
    { path: "diary/detail/:id", element: <DiaryDetail /> },
    { path: "diary-summary", element: <DiarySummary /> },
  ],
};

export default PatientRoutes;