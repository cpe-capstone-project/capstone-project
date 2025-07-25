import { BrowserRouter } from "react-router-dom";
import { PathContextProvider } from "./contexts/PathContext";
import { DateContextProvider } from "./contexts/DateContext";
import RouterComponent from "./routes/RouterComponent";

function App() {
  return (
    <BrowserRouter>
      <PathContextProvider>
        <DateContextProvider>
          <RouterComponent/>
        </DateContextProvider>
      </PathContextProvider>
    </BrowserRouter>
  );
}

export default App;
//