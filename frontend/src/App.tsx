import { BrowserRouter } from "react-router-dom";
import { PathContextProvider } from "./contexts/PathContext";
import { DateContextProvider } from "./contexts/DateContext";
import RouterComponent from "./routes/RouterComponent";
import { useEffect, useState } from "react";
import { k, KEYS, getUID } from "./unid/storageKeys";
import { TherapyCaseProvider } from "./contexts/TherapyCaseContext";

function App() {
  const [uid, setUid] = useState(getUID());

  // อัปเดต uid เมื่อผู้ใช้ล็อกอิน (id ถูก set ใน localStorage)
  useEffect(() => {
    const i = setInterval(() => {
      const now = getUID();
      if (now !== uid) setUid(now);
    }, 500);
    return () => clearInterval(i);
  }, [uid]);

  // migrate เมื่อรู้ uid แล้ว
  useEffect(() => {
    if (!uid) return;
    const migrate = (oldKey: string, newKey: string) => {
      const v = localStorage.getItem(oldKey);
      if (v && !localStorage.getItem(newKey)) localStorage.setItem(newKey, v);
    };
    migrate(KEYS.CHECK_DAY, k(KEYS.CHECK_DAY));
    migrate(KEYS.CHECK_BYDATE, k(KEYS.CHECK_BYDATE));
    migrate(KEYS.NOTI, k(KEYS.NOTI));
    migrate(KEYS.NOTICE_FLAG, k(KEYS.NOTICE_FLAG));
    migrate(KEYS.CAL, k(KEYS.CAL));
  }, [uid]);

  return (
    <BrowserRouter>
      <PathContextProvider>
        <DateContextProvider>
          <TherapyCaseProvider>
            <RouterComponent />
          </TherapyCaseProvider>
        </DateContextProvider>
      </PathContextProvider>
    </BrowserRouter>
  );
}

export default App;
