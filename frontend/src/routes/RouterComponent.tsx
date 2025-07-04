import { useRoutes } from "react-router-dom";
import RoleRoutes from "./RoleRoutes";

const RouterComponent = () => {
  return useRoutes(RoleRoutes);
};

export default RouterComponent;