import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import LeaveDetailModal from "../components/LeaveDetailModal";
import { employeeMenu } from "../menus/Employee";
import api from "../api/axiosConfig";
import { getLeaveRequestDetail } from "../api/LeaveRequest"; 

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [leaveList, setLeaveList] = useState([]);
  const [balance, setBalance] = useState({
    totalDays: 0,
    usedDays: 0,
    pendingDays: 0,
    year: new Date().getFullYear()
  });
  const [isLoading, setIsLoading] = useState(true);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const handleOpenDetail = async (requestId) => {
    try {
      setDetailLoading(true);
      const detail = await getLeaveRequestDetail(requestId);
    setSelectedLeave(detail);
    } catch (err) {
    console.error(err);
    } finally {
    setDetailLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [listResponse, balanceResponse] = await Promise.all([
          api.get('/leaves/list'),      
          api.get('/leaves/balance')    
      ]);

      setLeaveList(listResponse.data);
      setBalance(balanceResponse.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshAfterEdit = async (requestId) => {
    try {
      await fetchDashboardData();

      const detail = await getLeaveRequestDetail(requestId);
      setSelectedLeave(detail);
    } catch (err) {
    console.error("Lỗi khi làm mới dữ liệu:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  
  const remainingDays = balance.totalDays - balance.usedDays - balance.pendingDays;

  const renderStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Chờ duyệt</span>;
      case "APPROVED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Đã duyệt</span>;
      case "REJECTED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Từ chối</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <DashboardLayout 
      menuItems={employeeMenu}  
      pageTitle={`TỔNG QUAN CÁ NHÂN`}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Hàng 1: Các thẻ thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Tổng phép năm" 
              value={`${balance.totalDays} ngày`} 
              bgColorClass="bg-blue-50 text-blue-600" colorClass="text-slate-800"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            />
            <StatCard 
              title="Đã sử dụng" 
              value={`${balance.usedDays} ngày`} 
              bgColorClass="bg-emerald-50 text-emerald-600" colorClass="text-slate-800"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            />
            <StatCard 
              title="Đang chờ duyệt" 
              value={`${balance.pendingDays} ngày`} 
              bgColorClass="bg-amber-50 text-amber-600" colorClass="text-slate-800"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <StatCard 
              title="Phép còn lại" 
              value={`${remainingDays > 0 ? remainingDays : 0} ngày`} 
              bgColorClass="bg-purple-50 text-purple-600" colorClass="text-purple-700"
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
          </div>

          {/* Hàng 2: Bảng dữ liệu lấy từ API */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Đơn nghỉ gần đây</h3>
              <button onClick={() => navigate("/leaves/create")} className="text-sm font-medium text-blue-600 hover:text-blue-700">Tạo đơn mới</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Mã đơn</th>
                    <th className="px-6 py-4">Loại phép</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Số ngày</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaveList.length > 0 ? (
                    leaveList.map((leave) => (
                      <tr key={leave.requestId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-700">{leave.requestCode}</td>
                        <td className="px-6 py-4 text-slate-600">{leave.leaveTypeName}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {leave.totalDays}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(leave.status)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleOpenDetail(leave.requestId)}
                            className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                        Bạn chưa có đơn nghỉ phép nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <LeaveDetailModal
            isOpen={!!selectedLeave}
            data={selectedLeave}
            onClose={() => setSelectedLeave(null)}
            onRefreshList={() => handleRefreshAfterEdit(selectedLeave.requestId)}
          />
        </>
      )}
    </DashboardLayout>
  );
}