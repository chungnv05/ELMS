import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import LeaveDetailModal from "../components/LeaveDetailModal";
import { employeeMenu } from "../menus/Employee";
import { managerMenu } from "../menus/Manager";
import { hrMenu } from "../menus/HR";
import api from "../api/axiosConfig";
import { getLeaveRequestDetail, deleteLeaveRequest } from "../api/LeaveRequest"; 

export default function LeaveManagementPage() {
  const navigate = useNavigate();
  const [leaveList, setLeaveList] = useState([]);
  const [balance, setBalance] = useState({
    totalDays: 0,
    usedDays: 0,
    pendingDays: 0,
    year: new Date().getFullYear()
  });
  const [isLoading, setIsLoading] = useState(true);
  

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // UX: State quản lý Modal Xác nhận Xóa
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, requestId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Hàm hiển thị Toast mượt mà
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleOpenDetail = async (requestId) => {
    try {
      setDetailLoading(true);
      const detail = await getLeaveRequestDetail(requestId);
      setSelectedLeave(detail);
    } catch (err) {
      console.error(err);
      showToast("Không thể tải chi tiết đơn.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // UX: Mở Modal Xác nhận Xóa thay vì window.confirm
  const confirmDelete = (requestId) => {
    setDeleteModal({ isOpen: true, requestId });
  };

  // UX: Hàm thực hiện xóa thực tế khi bấm Xác nhận trong Modal
  const executeDelete = async () => {
    if (!deleteModal.requestId) return;
    
    setIsDeleting(true);
    try {
      await deleteLeaveRequest(deleteModal.requestId);
      showToast("Đã xóa đơn nghỉ phép thành công!", "success");
      
      // Đóng modal và load lại dữ liệu
      setDeleteModal({ isOpen: false, requestId: null });
      await fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || "Có lỗi xảy ra khi xóa đơn.", "error");
    } finally {
      setIsDeleting(false);
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

    const currentMenu = useMemo(() => {
      const role = localStorage.getItem("role");
      switch (role) {
        case "ROLE_HR_ADMIN":
          return hrMenu;
        case "ROLE_MANAGER":
          return managerMenu;
        case "ROLE_EMPLOYEE":
        default:
          return employeeMenu; 
      }
    }, []);

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
      menuItems={currentMenu}  
      pageTitle={`QUẢN LÝ ĐƠN NGHỈ`}
    >
      {/* THÀNH PHẦN TOAST NOTIFICATION */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          {toast.type === 'success' ? (
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
          ) : (
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          )}
          <p className="font-semibold text-sm pr-4">{toast.message}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
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

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Đơn nghỉ gần đây</h3>
              <button onClick={() => navigate("/leaves/create")} className="text-sm font-medium px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">Tạo đơn mới</button>
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
                    <th className="px-6 py-4 text-center">Hành động</th>
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
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => handleOpenDetail(leave.requestId)}
                              className="px-4 py-1.5 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg text-xs font-semibold transition"
                            >
                              Chi tiết
                            </button>
                            
                            {leave.status === "PENDING" && (
                              <button 
                                onClick={() => confirmDelete(leave.requestId)}
                                className="px-4 py-1.5 border border-red-200 text-red-600 hover:text-white hover:bg-red-500 hover:border-red-500 rounded-lg text-xs font-semibold transition flex items-center justify-center min-w-[60px]"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                           <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           <p>Bạn chưa có đơn nghỉ phép nào.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* UX: MODAL XÁC NHẬN XÓA ĐƠN */}
          {deleteModal.isOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa đơn</h3>
                  <p className="text-sm text-slate-500">
                    Bạn có chắc chắn muốn xóa đơn nghỉ phép này không? Sau khi xóa, quỹ phép của bạn sẽ được hoàn lại. Thao tác này không thể hoàn tác.
                  </p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                    onClick={() => setDeleteModal({ isOpen: false, requestId: null })}
                    disabled={isDeleting}
                    className="px-4 py-2.5 text-sm text-slate-600 font-semibold rounded-xl hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200 flex items-center justify-center min-w-[100px] disabled:opacity-70"
                  >
                    {isDeleting ? (
                      <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : "Có, Xóa đơn"}
                  </button>
                </div>
              </div>
            </div>
          )}

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