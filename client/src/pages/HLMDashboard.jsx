import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
// Import menu tương ứng
import { HLMMenu } from "../menus/HLM"; 
import { getHLMStats, getPendingApprovals, approveDepartment, approveLeaveType } from "../api/HLMApi";

export default function HLMDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeDepartments: 0,
    pendingRequests: 0 
  });

  const [pendingDepts, setPendingDepts] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [processingId, setProcessingId] = useState({ id: null, type: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, approvalsData] = await Promise.all([
        getHLMStats(),
        getPendingApprovals()
      ]);
      
      setStats(statsData);
      setPendingDepts(approvalsData.departments || []);
      setPendingLeaves(approvalsData.leaveTypes || []);

    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu điều hành HLM.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (id, type, isApproved) => {
    const actionText = isApproved ? "Phê duyệt" : "Từ chối";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} đề xuất này?`)) return;

    setProcessingId({ id, type });
    try {
      if (type === 'DEPARTMENT') {
        await approveDepartment(id, isApproved);
      } else {
        await approveLeaveType(id, isApproved);
      }
      // Tải lại dữ liệu sau khi duyệt xong
      await fetchData(); 
    } catch (err) {
      alert(err.response?.data?.message || "Đã xảy ra lỗi khi xử lý yêu cầu!");
    } finally {
      setProcessingId({ id: null, type: null });
    }
  };

  return (
    <DashboardLayout menuItems={HLMMenu} pageTitle="Ban Giám Đốc (HLM)">
      <div className="m-6 space-y-6">
        
        {/* === PHẦN 1: TỔNG QUAN THỐNG KÊ === */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-center animate-fade-in-up">
            <p className="font-semibold">{error}</p>
            <button onClick={fetchData} className="mt-3 px-4 py-2 bg-white text-rose-600 rounded hover:bg-rose-100 transition shadow-sm">
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <StatCard 
              title="Tổng nhân sự toàn công ty" 
              value={stats.totalEmployees.toString()} 
              bgColorClass="bg-blue-50 text-blue-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
            />
            <StatCard 
              title="Phòng ban đang hoạt động" 
              value={stats.activeDepartments.toString()} 
              bgColorClass="bg-emerald-50 text-emerald-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} 
            />
            <StatCard 
              title="Cấu hình chờ duyệt" 
              value={stats.pendingRequests.toString()} 
              bgColorClass="bg-amber-50 text-amber-600" 
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
          {/* === BẢNG 1: PHÒNG BAN CHỜ DUYỆT === */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Phòng ban đề xuất mới</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{pendingDepts.length}</span>
            </div>
            <div className="overflow-x-auto flex-1 p-5">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="pb-3 font-semibold">Mã / Tên Phòng</th>
                    <th className="pb-3 font-semibold">Trưởng phòng</th>
                    <th className="pb-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDepts.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-6 text-slate-400">Không có yêu cầu nào</td></tr>
                  ) : (
                    pendingDepts.map(dept => (
                      <tr key={dept.departmentID}>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{dept.departmentCode}</p>
                          <p className="text-indigo-600 font-medium">{dept.departmentName}</p>
                        </td>
                        <td className="py-4 text-slate-700">
                          {/* Hiển thị Tên Trưởng phòng từ Backend trả về */}
                          {dept.managerName ? (
                             <span className="font-semibold">{dept.managerName}</span>
                          ) : (
                             <span className="text-slate-400 italic">Chưa bổ nhiệm</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApproval(dept.departmentID, 'DEPARTMENT', true)}
                              disabled={processingId.id === dept.departmentID}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded transition disabled:opacity-50" title="Phê duyệt"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button 
                              onClick={() => handleApproval(dept.departmentID, 'DEPARTMENT', false)}
                              disabled={processingId.id === dept.departmentID}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded transition disabled:opacity-50" title="Từ chối"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* === BẢNG 2: LOẠI NGHỈ PHÉP CHỜ DUYỆT === */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Loại nghỉ phép đề xuất mới</h2>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">{pendingLeaves.length}</span>
            </div>
            <div className="overflow-x-auto flex-1 p-5">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="pb-3 font-semibold">Tên loại nghỉ</th>
                    <th className="pb-3 font-semibold">Chi tiết cấu hình</th>
                    <th className="pb-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingLeaves.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-6 text-slate-400">Không có yêu cầu nào</td></tr>
                  ) : (
                    pendingLeaves.map(leave => (
                      <tr key={leave.typeId}>
                        <td className="py-4 font-bold text-slate-800">{leave.name}</td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {/* Tag 1: Có lương / Không lương */}
                            {leave.isPaid ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] rounded font-semibold border border-emerald-200">Có lương</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded font-semibold border border-slate-200">Không lương</span>
                            )}
                            
                            {/* Tag 2: Yêu cầu minh chứng */}
                            {leave.requiresEvidence && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] rounded font-semibold border border-amber-200">
                                Cần giấy tờ
                              </span>
                            )}

                            {/* Tag 3: Số ngày mặc định */}
                            {leave.defaultDays > 0 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] rounded font-semibold border border-blue-200">
                                {leave.defaultDays} ngày/năm
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApproval(leave.typeId, 'LEAVE', true)}
                              disabled={processingId.id === leave.typeId}
                              className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded transition disabled:opacity-50" title="Phê duyệt"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button 
                              onClick={() => handleApproval(leave.typeId, 'LEAVE', false)}
                              disabled={processingId.id === leave.typeId}
                              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded transition disabled:opacity-50" title="Từ chối"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}