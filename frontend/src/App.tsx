
import { Routes, Route } from "react-router-dom";
import Cute from "./pages/firstpage/cute";
import Login from "./pages/loginkub/login";
import Register from "./pages/register/register";
import Rolehealth from "./pages/rolehealth/rolehealth";
import Homepage from "./pages/homepage/homepage";
import Homedoc from "./pages/homedoc/homedoc";


function App() {
  return (
    <Routes>
      <Route path="/cute" element={<Cute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rolehealth" element={<Rolehealth />} />
      <Route path="/homepage" element={<Homepage />} />
      <Route path="/homedoc" element={<Homedoc />} />
      

    </Routes>
  );
}

export default App;
