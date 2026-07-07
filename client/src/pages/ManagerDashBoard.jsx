import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { managerMenu } from "../menus/Manager";
import { getManagerDashboardStats, getDepartmentEmployees } from "../api/ManagerApi"; 

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    employeesOnLeaveToday: 0,
    totalEmployees: 0
  });
  
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // 1. Thêm State lưu trữ lỗi
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null); // Reset lỗi mỗi lần gọi lại API
      try {
        const [statsData, employeesData] = await Promise.all([
          getManagerDashboardStats(),
          getDepartmentEmployees() 
        ]);
        
        setStats(statsData);
        const activeEmployees = employeesData.filter(emp => emp.isActive === true || emp.active === true);
        setEmployees(activeEmployees);

      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        // 2. Bắt lỗi và set message
        setError(err.response?.data?.message || "Đã xảy ra sự cố kết nối. Không thể tải dữ liệu phòng ban!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderRoleBadge = (role) => {
    switch(role) {
      case 'MANAGER': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Trưởng phòng</span>;
      case 'EMPLOYEE': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Nhân viên</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{role}</span>;
    }
  };

  return (
    <DashboardLayout menuItems={managerMenu} pageTitle="Thông tin phòng ban">
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        // 3. UI/UX HIỂN THỊ KHI CÓ LỖI XẢY RA
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-xl border border-rose-200 p-6 text-center shadow-sm animate-fade-in-up">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-slate-500 max-w-md mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2.5 bg-rose-100 text-rose-700 font-semibold rounded-lg hover:bg-rose-200 transition"
          >
            Tải lại trang
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          {/* Section 1: Thẻ thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Đơn cần duyệt" 
              value={`${stats.pendingRequests} đơn`} 
              bgColorClass="bg-blue-50 text-blue-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} 
            />
            <StatCard 
              title="Nhân viên đang nghỉ" 
              value={`${stats.employeesOnLeaveToday} người`} 
              bgColorClass="bg-amber-50 text-amber-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} 
            />
            <StatCard 
              title="Tổng nhân sự" 
              value={`${stats.totalEmployees} người`} 
              bgColorClass="bg-emerald-50 text-emerald-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
            />
          </div>

          {/* Section 2: Bảng danh sách nhân sự */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Danh sách nhân sự đang hoạt động</h2>
              <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                {employees.length} nhân sự
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Mã NV</th>
                    <th className="px-6 py-4 font-semibold">Họ và Tên</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Số điện thoại</th>
                    <th className="px-6 py-4 font-semibold text-center">Vai trò</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        Chưa có dữ liệu nhân sự hoạt động.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.empID} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{emp.empCode}</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{emp.fullName}</td>
                        <td className="px-6 py-4 text-slate-600">{emp.email}</td>
                        <td className="px-6 py-4 text-slate-600">{emp.phoneNumber}</td>
                        <td className="px-6 py-4 text-center">
                          {renderRoleBadge(emp.role)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}

    </DashboardLayout>
  );
}