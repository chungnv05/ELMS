import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { hrMenu } from "../menus/HR";
import { getLeaveTypes, toggleLeaveType } from "../api/HRApi";
import CreateLeaveTypeModal from "../components/CreateLeaveTypeModal";

export default function LeaveTypeManagement() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toggleModal, setToggleModal] = useState({ isOpen: false, id: null, name: "", currentStatus: true });
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getLeaveTypes();
      setLeaveTypes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu cấu hình.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeToggle = async () => {
    setIsToggling(true);
    try {
      await toggleLeaveType(toggleModal.id);
      setToggleModal({ isOpen: false, id: null, name: "", currentStatus: true });
      fetchLeaveTypes();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thao tác");
    } finally {
      setIsToggling(false);
    }
  };

  // Hàm hỗ trợ render UI cho trạng thái phê duyệt (status)
  const renderApprovalStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-xs font-semibold">Từ chối</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{status || 'N/A'}</span>;
    }
  };

  return (
    <DashboardLayout menuItems={hrMenu} pageTitle="Cấu Hình Loại Nghỉ Phép">
      <div className="m-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh mục nghỉ phép</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý và cấu hình các chính sách nghỉ phép</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition shadow-sm text-sm"
          >
            + Thêm loại nghỉ
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1 p-6">
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : error ? (
             <div className="text-red-500 text-center py-8 bg-red-50 rounded-lg">{error}</div>
          ) : (
            <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tên loại nghỉ</th>
                  <th className="px-6 py-3 font-semibold text-center">Hưởng lương</th>
                  <th className="px-6 py-3 font-semibold text-center">Minh chứng</th>
                  <th className="px-6 py-3 font-semibold text-center">Mặc định (Ngày)</th>
                  <th className="px-6 py-3 font-semibold text-center">Phê duyệt</th>
                  <th className="px-6 py-3 font-semibold text-center">Hoạt động</th>
                  <th className="px-6 py-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaveTypes.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-slate-500">Chưa có dữ liệu</td></tr>
                ) : (
                  leaveTypes.map((type) => (
                    <tr key={type.typeId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{type.name}</td>
                      <td className="px-6 py-4 text-center">
                        {type.isPaid ? <span className="text-emerald-600 font-medium">Có</span> : <span className="text-slate-400">Không</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {type.requiresEvidence ? <span className="text-amber-600 font-medium">Bắt buộc</span> : <span className="text-slate-400">Không</span>}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-indigo-600">{type.defaultDays}</td>
                      
                      {/* Cột Trạng thái Phê duyệt (mới thêm) */}
                      <td className="px-6 py-4 text-center">
                        {renderApprovalStatus(type.status)}
                      </td>

                      {/* Cột Trạng thái Hoạt động (isActive) */}
                      <td className="px-6 py-4 text-center">
                        {type.isActive ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Đang hoạt động</span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-semibold">Đã tắt</span>
                        )}
                      </td>
                      
                      {/* Cột Thao tác */}
                      <td className="px-6 py-4 text-center">
                        {type.status === 'APPROVED' ? (
                          <button 
                            onClick={() => setToggleModal({ isOpen: true, id: type.typeId, name: type.name, currentStatus: type.isActive })}
                            className={`text-sm font-semibold hover:underline ${type.isActive ? 'text-slate-500 hover:text-amber-600' : 'text-slate-500 hover:text-emerald-600'}`}
                          >
                            {type.isActive ? "Tắt cấu hình" : "Bật lại"}
                          </button>
                        ) : (
                          <span className="text-slate-300 text-sm italic">Chưa khả dụng</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Tắt/Bật */}
      {toggleModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {toggleModal.currentStatus ? "Tắt cấu hình" : "Bật hoạt động"}
              </h3>
              <p className="text-sm text-slate-600">
                Bạn có chắc chắn muốn {toggleModal.currentStatus ? "tắt" : "bật"} loại nghỉ: 
                <span className="font-semibold text-slate-900"> {toggleModal.name}</span>?
              </p>
            </div>
            <div className="px-5 py-4 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setToggleModal({ isOpen: false, id: null, name: "", currentStatus: true })}
                className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition"
              >Hủy</button>
              <button 
                onClick={executeToggle}
                disabled={isToggling}
                className={`px-4 py-2 text-white text-sm rounded transition ${toggleModal.currentStatus ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isToggling ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && <CreateLeaveTypeModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchLeaveTypes} />}
    </DashboardLayout>
  );
}