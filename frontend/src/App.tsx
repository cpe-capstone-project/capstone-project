import { BrowserRouter } from "react-router-dom";
// import Cute from "./pages/firstpage/cute";
// import Login from "./pages/loginkub/login";
// import Register from "./pages/register/register";
// import Rolehealth from "./pages/rolehealth/rolehealth";
// import Homepage from "./pages/homepage/homepage";
// import Homedoc from "./pages/homedoc/homedoc";
// import DiaryList from "./pages/diary_list/DiaryList";
import { PathContextProvider } from "./contexts/PathContext";
import { DateContextProvider } from "./contexts/DateContext";
import ConfigRoutes from "./routes/ConfigRoutes";

function App() {
  return (
    <BrowserRouter>
      <PathContextProvider>
        <DateContextProvider>
          <ConfigRoutes />
        </DateContextProvider>
      </PathContextProvider>
    </BrowserRouter>
    // <Routes>
    //   <Route path="/cute" element={<Cute />} />
    //   <Route path="/login" element={<Login />} />
    //   <Route path="/register" element={<Register />} />
    //   <Route path="/rolehealth" element={<Rolehealth />} />
    //   <Route path="/homepage" element={<Homepage />} />
    //   <Route path="/homedoc" element={<Homedoc />} />
    //   <Route
    //     path="/diary"
    //     element={
    //       <DiaryContextProvider>
    //         <DiaryList />
    //       </DiaryContextProvider>
    //     }
    //   />
    // </Routes>
  );
}

export default App;
