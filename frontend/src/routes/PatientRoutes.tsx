import { DiaryContextProvider } from "../contexts/DiaryContext";
import { ThoughtRecordProvider } from "../contexts/ThoughtRecordContext";
import PatientLayout from "../layout/FullLayout/PatientLayout";
import DiaryList from "../pages/diary_list/DiaryList";
import DiaryDetail from "../pages/diary_detail/DiaryDetail";
import RequireRole from "./RequireRole";
import DiarySummary from "../pages/diary_summary/DiarySummary";
import Homepage from "../pages/homepage/homepage";
import ThoughtRecordList from "../pages/thought_record_list/ThoughtRecordList";
import ThoughtRecordDetail from "../pages/thought_record_detail/ThoughtRecordDetail";
const PatientRoutes = {
  path: "/patient",
  element: (
    <RequireRole allowedRoles={["Patient"]}>
      <DiaryContextProvider>
        <ThoughtRecordProvider>
          <PatientLayout />
        </ThoughtRecordProvider>
      </DiaryContextProvider>
    </RequireRole>
  ),
  children: [
    { path: "home", element: <Homepage /> },
    { path: "diary", element: <DiaryList /> },
    { path: "diary/detail/:id", element: <DiaryDetail /> },
    { path: "diary-summary", element: <DiarySummary /> },
    { path: "thought_records", element: <ThoughtRecordList /> },
    { path: "thought_record/:id", element: <ThoughtRecordDetail /> },

  ],
};

export default PatientRoutes;