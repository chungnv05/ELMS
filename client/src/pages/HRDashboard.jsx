import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { hrMenu } from "../menus/HR";
import { getCompanyStats } from "../api/HRApi"; 

export default function HRDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartment: 0,
    pendingRequests: 0,
    onLeaveToday: 0,
    requestsThisMonth: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyStats(); 
      setStats(data);
    } catch (err) {
      console.error("Lỗi tải thống kê HR:", err);
      setError("Không thể tải dữ liệu thống kê thực tế từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout menuItems={hrMenu} pageTitle="Trung tâm Điều hành HR">
      <div className="m-6">
        {isLoading ? (
          /* TRẠNG THÁI LOADING MƯỢT MÀ */
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ dữ liệu điều hành...</p>
          </div>
        ) : error ? (
          /* TRẠNG THÁI LỖI UI/UX CAO CẤP */
          <div className="flex flex-col items-center justify-center h-64 bg-red-50/50 border border-red-100 border-dashed rounded-2xl animate-fade-in-up">
            <svg className="w-12 h-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-slate-600 font-medium mb-4">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              Thử lại
            </button>
          </div>
        ) : (
          /* GIAO DIỆN HIỂN THỊ DỮ LIỆU THẬT - ĐÃ LÊN GRID 5 CỘT */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            
            {/* Thẻ 1: Tổng nhân sự */}
            <StatCard 
              title="Tổng nhân sự" 
              value={stats.totalEmployees.toString()} 
              bgColorClass="bg-blue-50 text-blue-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
            />

            {/* THẺ MỚI 2: Tổng phòng ban */}
            <StatCard 
              title="Tổng phòng ban" 
              value={stats.totalDepartment.toString()} 
              bgColorClass="bg-teal-50 text-teal-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} 
            />

            {/* Thẻ 3: Đơn PENDING */}
            <StatCard 
              title="Đơn PENDING" 
              value={stats.pendingRequests.toString()} 
              bgColorClass="bg-red-50 text-red-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} 
            />

            {/* Thẻ 4: Nghỉ phép hôm nay */}
            <StatCard 
              title="Nghỉ phép hôm nay" 
              value={stats.onLeaveToday.toString()} 
              bgColorClass="bg-amber-50 text-amber-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} 
            />

            {/* Thẻ 5: Số đơn tháng này */}
            <StatCard 
              title="Số đơn tháng này" 
              value={stats.requestsThisMonth.toString()} 
              bgColorClass="bg-violet-50 text-violet-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
            />

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}