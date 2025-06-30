import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "../views/auth/login";
import Layout from "../layout/layout";
import Dashboard from "../views/admin/dashboard";
import Transaction from '../views/admin/transaction';
import User from "../views/admin/user";
import Camera from "../views/admin/camera"
import Gate from "../views/admin/gate"
// Scroll to Top when switching page
const ScrollToTop = ({ children }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
};
// Private routing
const Auth = ({ children }) => {
  const token = localStorage.getItem("token");

  // Function to manually decode the JWT
  const decodeJWT = (token) => {
    if (!token) return null;

    const payload = token.split('.')[1]; // Get the payload part
    if (!payload) return null;

    // Decode Base64Url
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload); // Parse JSON
  };

  // Check if token is present and not expired
  const isTokenExpired = () => {
    const decodedToken = decodeJWT(token);
    if (!decodedToken) return true;

    // Check expiration
    return decodedToken.exp * 1000 < Date.now(); // Convert exp to milliseconds
  };

  if (isTokenExpired()) {
    localStorage.removeItem("token"); // Clear expired token
    return <Navigate to="/login" replace />;
  }

  return children;
};
const Router = () => {
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Routes>
          {/* Auth Routes  */}
          <Route path="/login" element={<Login />} />
          {/* Main Routes */}
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<Auth><Dashboard /></Auth>} />
          </Route>
          <Route path="/transaction" element={<Layout />}>
            <Route index element={<Auth><Transaction /></Auth>} />
          </Route>
          <Route path="/gate" element={<Layout />}>
            <Route index element={<Auth><Gate /></Auth>} />
          </Route>
          <Route path="/camera" element={<Layout />}>
            <Route index element={<Auth><Camera /></Auth>} />
          </Route>
          <Route path="/user" element={<Layout />}>
            <Route index element={<Auth><User /></Auth>} />
          </Route>
        </Routes>
      </ScrollToTop>
    </BrowserRouter >
  );
};

export default Router;