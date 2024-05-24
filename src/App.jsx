import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import { IsLogin, Role, Name } from "./context";
import { useEffect, useState } from "react";
import CheckToken from "./api/auth/checkToken";
import { getCookie } from "cookies-next";
import { ManageUsers } from "./pages/dashboard";
// import ProtectedRoute from "./ProtectedRoute.js";


function App() {
  const [isLogin, setIsLogin] = useState(null);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");


  useEffect(() => {
    const checkToken = async () => {
      if (getCookie('token')) {
        const res = await CheckToken(getCookie('token'))
        if (res) {
          if (res.status === '200') {
            setIsLogin(true)
            setRole(res.data.role)
            setName(res.data.name)
            // console.log(res.)
          }
        }
      }
    }

    checkToken()
  }, [])
  // console.log(isLogin, role)
  return (
    <IsLogin.Provider value={isLogin}>
      <Role.Provider value={role}>
        <Name.Provider value={name}>
        <Routes>
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="*" element={<Navigate to="/dashboard/project" replace />} />
          {/* <Route
            path="/dashboard/manage-user"
            element={
              isLogin && role === "admin" ? (
                <Dashboard />
              ) : (
                <Navigate to="/dashboard/" replace />
              )
            }
          /> */}
        </Routes>
        </Name.Provider>
      </Role.Provider>
    </IsLogin.Provider>
  );
}

export default App;
