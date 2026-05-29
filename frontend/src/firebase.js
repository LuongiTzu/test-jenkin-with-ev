// 📦 Import SDKs
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, logEvent } from "firebase/analytics";

// 🚀 Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDq7Em_OzAMvF0Jm1W9cPw40Eb0jREHQco",
  authDomain: "ev-battery-swap-system.firebaseapp.com",
  projectId: "ev-battery-swap-system",
  storageBucket: "ev-battery-swap-system.appspot.com", // ✅ sửa lại đúng
  messagingSenderId: "450888971417",
  appId: "1:450888971417:web:4637cb9114cd6882833408",
  measurementId: "G-6H8GFYNXHH"
};

// ⚙️ Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// 🔥 Bật Analytics
const analytics = getAnalytics(app);
logEvent(analytics, "page_view");
console.log("✅ Firebase Analytics connected");

// 🔔 FCM (Thông báo)
const messaging = getMessaging(app);

export const requestPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BPNx56zwXbQJbTCjZZad7z6UJr7zC_gmPoAx_JPYO8fNDu8p4akt5D3fDtUdNwrXNA2XecNz3dM1cEnPMmgPxuE" // 🔑 thay bằng VAPID Key thật
    });
    console.log("FCM token:", token);
    return token;
  } catch (error) {
    console.error("Permission denied:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

// 🔄 Xuất để App.js dùng
export { analytics };
