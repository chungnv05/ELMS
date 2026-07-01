import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardRouter from "./pages/DashboardRouter";
import CreateLeavePage from "./pages/CreateLeavePage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage"

// Component bảo vệ: Kiểm tra xem người dùng đã có Token chưa
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  // Nếu chưa đăng nhập (không có token), đẩy thẳng về trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Nếu hợp lệ, cho phép render component con (Dashboard)
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang chủ mặc định đẩy về Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Route Công khai */}
        <Route path="/login" element={<LoginPage />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaves/create" 
          element={
            <ProtectedRoute>
              <CreateLeavePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approval" 
          element={
            <ProtectedRoute>
              <LeaveApprovalPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Các route khác sẽ được thêm và bọc bởi <ProtectedRoute> sau */}
      </Routes>
    </BrowserRouter>
  );
}