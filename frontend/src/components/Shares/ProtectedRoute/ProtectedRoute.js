// src/components/Shares/ProtectedRoute/ProtectedRoute.js
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router";

const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = "/login"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");
      const storedUserRole = localStorage.getItem("userRole");

      console.log("🔐 ProtectedRoute - Checking authentication");

      // Nếu route không yêu cầu auth
      if (!requireAuth) {
        setIsLoading(false);
        setIsVerified(true);
        return;
      }

      // Nếu không có token
      if (!token) {
        console.log("❌ No token found");
        setIsLoading(false);
        setIsVerified(false);
        return;
      }

      try {
        // Verify token với backend
        console.log("🔄 Verifying token...");
        const response = await fetch("/api/user-service/auth/verify", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Token invalid");
        }

        const userData = await response.json();
        console.log("✅ Token verified:", userData);

        const { role: realRole, userId: realUserId } = userData;

        // 🔒 QUAN TRỌNG: Kiểm tra chống giả mạo localStorage
        if (storedUserId !== realUserId.toString() || storedUserRole !== realRole) {
          console.error("🚨 LocalStorage tampering detected!");
          // Xóa hết auth data và đá ra login
          localStorage.removeItem("token");
          localStorage.removeItem("userRole");
          localStorage.removeItem("userId");
          localStorage.removeItem("hoTen");
          localStorage.removeItem("userEmail");
          setIsLoading(false);
          setIsVerified(false);
          return;
        }

        // Kiểm tra role nếu có yêu cầu
        if (allowedRoles.length > 0 && !allowedRoles.includes(realRole)) {
          console.log(`❌ Role not allowed: ${realRole}`);
          setIsLoading(false);
          setIsVerified(false);
          return;
        }

        // Cập nhật state
        setIsVerified(true);
        
      } catch (error) {
        console.error("💥 Auth verification failed:", error);
        // Xóa token invalid
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, allowedRoles, location.pathname]); // Chỉ chạy lại khi route thay đổi

  // Hiển thị loading
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "200px",
        fontSize: "16px",
        color: "#666"
      }}>
        <div>🔐 Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  // Nếu route không yêu cầu auth
  if (!requireAuth) {
    return children;
  }

  // Nếu không được verify → redirect đến login
  if (!isVerified) {
    return (
      <Navigate 
        to={redirectTo} 
        replace 
        state={{ from: location }} 
      />
    );
  }

  // Cho phép truy cập
  return children;
};

export default ProtectedRoute;