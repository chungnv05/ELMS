import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { hrMenu } from "../menus/HR";
import { getEmployees, toggleEmployeeStatus } from "../api/HRApi";
import CreateEmployeeModal from "../components/CreateEmployeeModal";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toggleModal, setToggleModal] = useState({ isOpen: false, empId: null, empName: "", currentStatus: true });
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError(null); 
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };


  const confirmToggle = (empId, empName, currentStatus) => {
    setToggleModal({ isOpen: true, empId, empName, currentStatus });
  };


  const executeToggle = async () => {
    if (!toggleModal.empId) return;
    
    setIsToggling(true);
    const action = toggleModal.currentStatus ? "Khóa" : "Mở khóa";

    try {
      await toggleEmployeeStatus(toggleModal.empId);
      showToast(`Đã ${action.toLowerCase()} tài khoản của ${toggleModal.empName} thành công!`, "success");
      setToggleModal({ isOpen: false, empId: null, empName: "", currentStatus: true });
      fetchEmployees(); 
    } catch (err) {
      showToast(err.response?.data?.message || `Có lỗi xảy ra khi ${action.toLowerCase()} tài khoản`, "error");
    } finally {
      setIsToggling(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.empCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch(role) {
      case 'HR_ADMIN': return <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold border border-purple-100">HR ADMIN</span>;
      case 'MANAGER': return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">QUẢN LÝ</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">NHÂN VIÊN</span>;
    }
  };

  return (
    <DashboardLayout menuItems={hrMenu} pageTitle="Quản Lý Nhân Sự">
      
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

      <div className="m-6 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
        
        {/* Header & Thanh công cụ */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh sách nhân sự</h2>
            <p className="text-sm text-slate-500 mt-1">Quản lý hồ sơ và phân quyền truy cập hệ thống</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Tìm tên, mã NV..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading || error}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm w-64 transition-all disabled:opacity-50 disabled:bg-slate-50"
              />
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              disabled={isLoading || error}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:shadow-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Bảng dữ liệu / Các trạng thái Loading & Error */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm h-full">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Liên hệ</th>
                <th className="px-6 py-4">Phòng ban</th>
                <th className="px-6 py-4 text-center">Vai trò</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="h-[400px]">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 mt-4 font-medium animate-pulse">Đang tải dữ liệu nhân sự...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="h-[400px] p-6">
                    <div className="flex flex-col items-center justify-center h-full w-full bg-red-50/40 border border-red-100 border-dashed rounded-2xl animate-fade-in-up">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-red-50">
                        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">Không thể tải danh sách</h3>
                      <p className="text-slate-500 mb-6 text-sm text-center max-w-md">{error}</p>
                      <button 
                        onClick={fetchEmployees}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 group"
                      >
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Thử tải lại dữ liệu
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-[400px] p-6">
                    <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl">
                       <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                       <p className="text-slate-500 font-medium text-base">Không tìm thấy nhân viên nào phù hợp.</p>
                       <p className="text-slate-400 text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.empID} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{emp.fullName}</p>
                          <p className="text-xs text-slate-500 font-medium">Mã: {emp.empCode}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600">
                      <p>{emp.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{emp.phoneNumber || "Chưa có SĐT"}</p>
                    </td>
                    
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {emp.departmentName || "Chưa phân bổ"}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {getRoleBadge(emp.role)}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Còn hợp đồng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Hết hợp đồng
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Nút Xem chi tiết */}
                        <button 
                          onClick={() => alert("Chức năng xem chi tiết sẽ được phát triển sau!")}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" 
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        
                        {/* Nút Khóa / Mở khóa có gọi confirmToggle */}
                        <button 
                          onClick={() => confirmToggle(emp.empID, emp.fullName, emp.isActive)}
                          className={`p-2 rounded-lg transition ${emp.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`} 
                          title={emp.isActive ? "Khóa tài khoản" : "Mở khóa"}
                        >
                          {emp.isActive ? (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          ) : (
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                          )}
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

      {toggleModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            
            <div className="p-5">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                {toggleModal.currentStatus ? "Khóa tài khoản" : "Mở khóa tài khoản"}
              </h3>
              <p className="text-sm text-slate-600">
                Xác nhận {toggleModal.currentStatus ? "khóa" : "mở khóa"} tài khoản của nhân viên 
                <span className="font-semibold text-slate-900"> {toggleModal.empName}</span>?
              </p>
            </div>
            
            <div className="px-5 pb-5 flex justify-end gap-2">
              <button 
                onClick={() => setToggleModal({ isOpen: false, empId: null, empName: "", currentStatus: true })}
                disabled={isToggling}
                className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={executeToggle}
                disabled={isToggling}
                className={`px-4 py-2 text-white text-sm rounded transition disabled:opacity-70 ${toggleModal.currentStatus ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isToggling ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>

          </div>
        </div>
      )}

      {isCreateModalOpen && <CreateEmployeeModal onClose={() => setIsCreateModalOpen(false)} onRefresh={fetchEmployees} showToast={showToast} />}
      
    </DashboardLayout>
  );
}