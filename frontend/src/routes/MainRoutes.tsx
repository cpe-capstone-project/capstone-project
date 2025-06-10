import { lazy } from "react";

// import { RouteObject } from "react-router-dom";

// import MinimalLayout from "../layout/MinimalLayout";

import Loadable from "../components/third-patry/Loadable";
import type { RouteObject } from "react-router";
// import PatientHomePage from "../pages/home/PatientHomePage";
import MinimalLayout from "../layout/MinimalLayout/MinimalLayout";
// import SignInPages from "../pages/authentication/Login/signin";

const SignIn = Loadable(lazy(() => import("../pages/authentication/Login/SignIn")));

const Register = Loadable(lazy(() => import("../pages/authentication/Register/SignUp")));

const MainRoutes = (): RouteObject => {
  return {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        index: true,
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <Register />,
      },
      {
        path: "*",
        element: <SignIn />,
      },
    ],
  };
};

export default MainRoutes;
