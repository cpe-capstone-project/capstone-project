import { BrowserRouter } from "react-router";
import ConfigRoutes from "./routes/ConfigRoutes";
import { PathContextProvider } from "./contexts/PathContext";
import { DateContextProvider } from "./contexts/DateContext";

function App() {
  return (
    <BrowserRouter>
      <PathContextProvider>
        <DateContextProvider>
          <ConfigRoutes />
        </DateContextProvider>
      </PathContextProvider>
    </BrowserRouter>
  );
}

export default App;
