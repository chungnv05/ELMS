import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { hrMenu } from "../menus/HR";
import { getDepartments, toggleDepartment } from "../api/HRApi"; 
import CreateDepartmentModal from "../components/CreateDepartmentModal"; // Component Modal tạo mới

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toggleModal, setToggleModal] = useState({ isOpen: false, id: null, name: "", currentStatus: true });
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu phòng ban. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeToggle = async () => {
    setIsToggling(true);
    try {
      await toggleDepartment(toggleModal.id);
      setToggleModal({ isOpen: false, id: null, name: "", currentStatus: true });
      fetchDepartments(); // Gọi lại API để làm mới danh sách
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi thao tác thay đổi trạng thái!");
    } finally {
      setIsToggling(false);
    }
  };

  // Hàm hỗ trợ render UI cho trạng thái phê duyệt (status / approvalStatus)
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
    <DashboardLayout menuItems={hrMenu} pageTitle="Cơ cấu Phòng ban">
      <div className="m-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col animate-fade-in-up">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh sách Phòng ban</h2>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition shadow-sm text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm phòng ban
          </button>
        </div>

        {/* Content Section (Loading / Error / Table) */}
        <div className="overflow-x-auto flex-1 p-6">
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
               <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-4">{error}</p>
              <button onClick={fetchDepartments} className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded hover:bg-slate-200">
                Thử lại
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Mã Phòng</th>
                  <th className="px-6 py-3 font-semibold">Tên Phòng Ban</th>
                  <th className="px-6 py-3 font-semibold">Trưởng phòng</th>
                  <th className="px-6 py-3 font-semibold text-center">Phê duyệt</th>
                  <th className="px-6 py-3 font-semibold text-center">Hoạt động</th>
                  <th className="px-6 py-3 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-slate-500">Chưa có dữ liệu phòng ban</td></tr>
                ) : (
                  departments.map((dept) => (
                    <tr key={dept.departmentID} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-600">{dept.departmentCode}</td>
                      <td className="px-6 py-4 font-bold text-indigo-700">{dept.departmentName}</td>
                      {/* Xử lý trường hợp chưa có trưởng phòng */}
                      <td className="px-6 py-4 text-slate-700">
                        {dept.managerName ? dept.managerName : <span className="text-slate-400 italic">Chưa bổ nhiệm</span>}
                      </td>
                      
                      {/* Cột Phê duyệt */}
                      <td className="px-6 py-4 text-center">
                        {renderApprovalStatus(dept.approvalStatus || dept.status)}
                      </td>

                      {/* Cột Hoạt động */}
                      <td className="px-6 py-4 text-center">
                        {dept.isActive || dept.active ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">Đang hoạt động</span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-semibold">Đã tắt</span>
                        )}
                      </td>
                      
                      {/* Cột Thao tác */}
                      <td className="px-6 py-4 text-center">
                        {/* Chỉ cho phép Tắt/Bật khi phòng ban ĐÃ ĐƯỢC DUYỆT */}
                        {(dept.approvalStatus === 'APPROVED' || dept.status === 'APPROVED') ? (
                          <button 
                            onClick={() => setToggleModal({ 
                              isOpen: true, 
                              id: dept.departmentID, 
                              name: dept.departmentName, 
                              currentStatus: dept.isActive || dept.active 
                            })}
                            className={`text-sm font-semibold hover:underline ${dept.isActive || dept.active ? 'text-slate-500 hover:text-rose-600' : 'text-slate-500 hover:text-emerald-600'}`}
                          >
                            {dept.isActive || dept.active ? "Tắt hoạt động" : "Bật hoạt động"}
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

      {/* Modal Xác nhận Tắt/Bật */}
      {toggleModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {toggleModal.currentStatus ? "Tắt hoạt động phòng ban" : "Bật hoạt động phòng ban"}
              </h3>
              <p className="text-sm text-slate-600">
                Bạn có chắc chắn muốn {toggleModal.currentStatus ? "tắt" : "bật"} phòng: 
                <span className="font-semibold text-slate-900"> {toggleModal.name}</span>?
              </p>
              {toggleModal.currentStatus && (
                <p className="text-xs text-rose-500 mt-2 mt-1">
                  *Lưu ý: Sau khi tắt, phòng ban này sẽ không xuất hiện trong danh sách chọn của nhân viên mới.
                </p>
              )}
            </div>
            <div className="px-5 py-4 bg-slate-50 flex justify-end gap-2">
              <button 
                onClick={() => setToggleModal({ isOpen: false, id: null, name: "", currentStatus: true })}
                className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition"
              >Hủy</button>
              <button 
                onClick={executeToggle}
                disabled={isToggling}
                className={`px-4 py-2 text-white text-sm rounded transition ${toggleModal.currentStatus ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isToggling ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Mới */}
      {isCreateModalOpen && <CreateDepartmentModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchDepartments} />}
    </DashboardLayout>
  );
}