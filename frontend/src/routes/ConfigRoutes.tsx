import { useRoutes, type RouteObject } from "react-router";
import AdminRoutes from "./AdminRoutes";
import MainRoutes from "./MainRoutes";


function ConfigRoutes() {
  const isLoggedIn = localStorage.getItem("isLogin") === "true";
  const routes: RouteObject[] = [];

  if (isLoggedIn) {
    routes.push(AdminRoutes());
  } else {
    routes.push(MainRoutes());
  }

  return useRoutes(routes);
}

export default ConfigRoutes;