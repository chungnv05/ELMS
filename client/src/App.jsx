import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardRouter from "./pages/DashboardRouter";
import CreateLeavePage from "./pages/CreateLeavePage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage";
import PersonalCalendar from "./pages/PersonalCalendar";
import ProfilePage from "./pages/ProfilePage";
import ChangePass from "./pages/ChangePass";
import EmployeeManagement from "./pages/EmployeeManagement";
import TeamCalendar from "./pages/TeamCalendar";
import LeaveTypeManagement from "./pages/LeaveTypeManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import LeaveManagementPage from "./pages/LeaveManagementPage";

// Kiểm tra xem người dùng đã có Token chưa
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  

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
        <Route 
          path="/personal-calendar" 
          element={
            <ProtectedRoute>
              <PersonalCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/change-password" 
          element={
            <ProtectedRoute>
              <ChangePass />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employees" 
          element={
            <ProtectedRoute>
              <EmployeeManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/team-calendar" 
          element={
            <ProtectedRoute>
              <TeamCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leave-types" 
          element={
            <ProtectedRoute>
              <LeaveTypeManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/departments" 
          element={
            <ProtectedRoute>
              <DepartmentManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/leaves/manage" 
          element={
            <ProtectedRoute>
              <LeaveManagementPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}