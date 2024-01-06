import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import LogoutHandler from "./pages/Authentication/components/Logout";
import ProfilePage from "./pages/Profile";
import Class from "./pages/Class";
import Login from "./pages/Authentication/components/login";
import Register from "./pages/Authentication/components/register";
import VerifyPage from "./pages/Authentication/components/Verify";
import JoinClass from "./pages/JoinClass";

type RouterProp = {
  path: string;
  component: ReactElement;
};

const privateRoutes: RouterProp[] = [
  {
    path: "/",
    component: <Navigate to="/home" />,
  },
  {
    path: "/home",
    component: <Home />,
  },
  {
    path: "/logout",
    component: <LogoutHandler />,
  },
  {
    path: "/profile",
    component: <ProfilePage></ProfilePage>,
  },
  {
    path: "/classes/:classId",
    component: <Class />,
  },
];

const publicRoutes: RouterProp[] = [
  {
    path: "/login",
    component: <Login />,
  },
  {
    path: "/register",
    component: <Register />,
  },
  {
    path: "auth/verify",
    component: <VerifyPage />,
  },
  { path: "/classes/join/:classCode", component: <JoinClass /> },
];

export { privateRoutes, publicRoutes };
