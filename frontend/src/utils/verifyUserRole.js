// src/utils/authVerify.js
export const verifyUserRole = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return { success: false, error: "No token" };
    }

    const response = await fetch("/api/user-service/auth/verify", {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    const userData = await response.json();
    
    // Cập nhật localStorage với role THẬT từ backend
    localStorage.setItem("userRole", userData.role);
    localStorage.setItem("userEmail", userData.email || "");
    localStorage.setItem("userId", userData.userId || "");
    localStorage.setItem("hoTen", userData.hoTen || "");

    return { 
      success: true, 
      user: userData 
    };
  } catch (error) {
    console.error("Role verification error:", error);
    // Xóa token nếu invalid
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    return { success: false, error: error.message };
  }
};