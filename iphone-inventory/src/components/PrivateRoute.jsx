import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Kiểm tra token trong localStorage hoặc sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    // Nếu chưa đăng nhập, chuyển về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã có token, cho phép truy cập vào component con
  return children;
};

export default PrivateRoute;
