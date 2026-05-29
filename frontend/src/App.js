import { BrowserRouter, Routes, Route, Navigate } from "react-router"; // THÊM Navigate
import { PublicLayout, PrivateLayout } from "./components/Layouts";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Authentication/Login/Login";
import Register from "./pages/Authentication/Register/Register";
import AIInsights from "./pages/Admin/AIInsights/AIInsights";
import Alerts from "./pages/Admin/Alerts/Alerts";
import React, { useEffect } from "react";
import { requestPermission } from "./firebase";
import { onMessageListener } from "./firebase";
import { analytics } from "./firebase";
import { logEvent } from "firebase/analytics";

import {
  FindStation,
  History,
  Information,
  ChangeBattery,
  Support,
} from "./pages/Driver";
import {
  Batteries,
  Customers,
  Overview,
  Staff,
  Stations,
  ServicePackages,
  InformationAdmin,
  Feedback,
} from "./pages/Admin";
import { Report, Inventory, QueueManagement, Transaction } from "./pages/Staff";
import ProtectedRoute from "./components/Shares/ProtectedRoute/ProtectedRoute.js";
import Unauthorized from "./utils/Unauthorized/Unauthorized.js";

// THÊM: Component bảo vệ toàn bộ dashboard
const ProtectedLayout = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    console.log("App loaded");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // 👉 chỉ dùng 1 lần requestPermission để lấy FCM token
    requestPermission().then((fcmToken) => {
      console.log("FCM Token:", fcmToken);

      if (!fcmToken) return;

      // 👉 chỉ gọi API CHUẨN
      fetch("http://localhost:8080/api/user-service/fcm/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maNguoiDung: user.id,
          vaiTro: user.role,
          token: fcmToken,
        }),
      });
    });

    // 🔔 Lắng nghe thông báo khi web đang mở onMessageListener().then((payload) => { console.log("📨 Nhận thông báo:", payload); alert(${payload.notification.title}\n${payload.notification.body}); }); }, []);
    onMessageListener().then((payload) => {
      console.log("📨 Nhận thông báo:", payload);
      alert(`${payload.notification.title}\n${payload.notification.body}`);
    });
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="unauthorized" element={<Unauthorized />} />{" "}
            {/* QUAN TRỌNG */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* BỌC PrivateLayout VỚI ProtectedLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <PrivateLayout />
              </ProtectedLayout>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Driver - chỉ TAIXE được truy cập */}
            <Route
              path="findstation"
              element={
                <ProtectedRoute allowedRoles={["TAIXE"]}>
                  <FindStation />
                </ProtectedRoute>
              }
            />
            <Route
              path="changebattery"
              element={
                <ProtectedRoute allowedRoles={["TAIXE"]}>
                  <ChangeBattery />
                </ProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <ProtectedRoute allowedRoles={["TAIXE"]}>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="information"
              element={
                <ProtectedRoute allowedRoles={["TAIXE"]}>
                  <Information />
                </ProtectedRoute>
              }
            />
            <Route
              path="support"
              element={
                <ProtectedRoute allowedRoles={["TAIXE"]}>
                  <Support />
                </ProtectedRoute>
              }
            />

            {/* Staff - chỉ NHANVIEN được truy cập */}
            <Route
              path="transaction"
              element={
                <ProtectedRoute allowedRoles={["NHANVIEN"]}>
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="queueManagement"
              element={
                <ProtectedRoute allowedRoles={["NHANVIEN"]}>
                  <QueueManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <ProtectedRoute allowedRoles={["NHANVIEN"]}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="report"
              element={
                <ProtectedRoute allowedRoles={["NHANVIEN"]}>
                  <Report />
                </ProtectedRoute>
              }
            />

            {/* Admin - chỉ ADMIN được truy cập */}
            <Route
              path="overview"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Overview />
                </ProtectedRoute>
              }
            />
            <Route
              path="stations"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Stations />
                </ProtectedRoute>
              }
            />
            <Route
              path="batteries"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Batteries />
                </ProtectedRoute>
              }
            />
            <Route
              path="customers"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Customers />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="aiinsights"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AIInsights />
                </ProtectedRoute>
              }
            />
            <Route
              path="alerts"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="servicePackages"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <ServicePackages />
                </ProtectedRoute>
              }
            />
            <Route
              path="informationAdmin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
      
                  <InformationAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="feedback"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Feedback />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
