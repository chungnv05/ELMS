import React, { useState, useEffect } from "react";
import ImportEmployeeModal from "./ImportEmployeeModal";
// Đảm bảo bạn đã export getDepartments và createEmployee trong file HRApi.js
import { createEmployee, getDepartments } from "../api/HRApi"; 

export default function CreateEmployeeModal({ onClose, onRefresh, showToast }) {
  const [formData, setFormData] = useState({
    empCode: "", fullName: "", email: "", password: "",
    phoneNumber: "", address: "", role: "EMPLOYEE",
    hiredDate: "", departmentID: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDeptData = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải danh sách phòng ban!");
      }
    };
    fetchDeptData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createEmployee({ ...formData, departmentID: parseInt(formData.departmentID) });
      
      if (showToast) {
        showToast(`Tạo tài khoản thành công cho nhân viên ${formData.fullName}!`, "success");
      }

      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Tạo tài khoản nhân viên mới</h2>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
              >
                + Nhập qua Excel
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl font-light">✕</button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/30">
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <form id="create-emp-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Cột 1 */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mã nhân viên <span className="text-red-500">*</span></label>
                  <input 
                    name="empCode" value={formData.empCode} onChange={handleInputChange} required 
                    placeholder="VD: NV001" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input 
                    name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                    placeholder="Nguyễn Văn A" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email hệ thống <span className="text-red-500">*</span></label>
                  <input 
                    name="email" type="email" value={formData.email} onChange={handleInputChange} required 
                    placeholder="nguyenvana@congty.com" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                  <input 
                    name="password" type="text" value={formData.password} onChange={handleInputChange} required minLength="6"
                    placeholder="Ít nhất 6 ký tự" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>

              {/* Cột 2 */}
              <div className="space-y-6">
                
                {/* Đổ dữ liệu Phòng ban từ API */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phòng ban <span className="text-red-500">*</span></label>
                  <select 
                    name="departmentID" value={formData.departmentID} onChange={handleInputChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="" disabled>-- Chọn phòng ban --</option>
                    {departments
                      .filter(d => d.active)
                      .map(d => (
                        <option key={d.departmentID} value={d.departmentID}>
                          {d.departmentName}
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vị trí <span className="text-red-500">*</span></label>
                  <select 
                    name="role" value={formData.role} onChange={handleInputChange} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="EMPLOYEE">Nhân viên</option>
                    <option value="MANAGER">Quản lý / Trưởng bộ phận</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ngày ký hợp đồng <span className="text-red-500">*</span></label>
                  <input 
                    name="hiredDate" type="date" value={formData.hiredDate} onChange={handleInputChange} required 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input 
                    name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>
              </div>

              {/* Trải dài 2 cột */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Địa chỉ liên hệ</label>
                <input 
                  name="address" value={formData.address} onChange={handleInputChange} 
                  placeholder="Nhập địa chỉ" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                />
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
            <button 
              onClick={onClose} 
              type="button"
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Hủy thao tác
            </button>
            <button 
              form="create-emp-form" 
              type="submit" 
              disabled={isLoading} 
              className="px-8 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-70 transition flex items-center justify-center min-w-[140px]"
            >
              {isLoading ? "Đang lưu..." : "Xác nhận tạo"}
            </button>
          </div>

        </div>
      </div>

      {isImportModalOpen && <ImportEmployeeModal onClose={() => setIsImportModalOpen(false)} onRefresh={onRefresh} showToast={showToast} />}
    </>
  );
}