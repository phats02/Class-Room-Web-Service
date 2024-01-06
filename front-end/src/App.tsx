import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRouter from "./pages/Authentication/components/common/PrivateRouter";
import { useSelector } from "react-redux";
import useAuth from "./hook/useAuth";
import NavBars from "./pages/NavTabs/navTabs";
import { RootState } from "./redux-toolkit/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { privateRoutes, publicRoutes } from "./router";
function App() {
  useAuth();
  const accessToken = useSelector(
    (state: any) => state.authReducer.accessToken
  );
  const currentUser = useSelector(
    (state: RootState) => state.userReducer.currentUser
  );
  return (
    <>
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
      >
        {!!accessToken && <NavBars currentUser={currentUser}></NavBars>}
        <ToastContainer />
        <Routes>
          {privateRoutes.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={
                <PrivateRouter isLogged={!!accessToken}>
                  {item.component}
                </PrivateRouter>
              }
            ></Route>
          ))}
          {publicRoutes.map((item) => (
            <Route
              key={item.path}
              path={item.path}
              element={item.component}
            ></Route>
          ))}
        </Routes>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
