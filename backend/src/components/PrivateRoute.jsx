import React from "react";
import { Navigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

function getDecodedToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwt_decode.default(token);
  } catch {
    return null;
  }
}

function PrivateRoute({ children, requiredRole }) {
  const decoded = getDecodedToken();

  if (!decoded) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra token hết hạn (nếu token có trường exp)
  const now = Date.now().valueOf() / 1000;
  if (decoded.exp && decoded.exp < now) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(decoded.role)) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return children;
}

export default PrivateRoute;
