import React, { useState, useEffect } from "react";
// Giả sử bạn đã viết sẵn hàm getManagers trong HRApi
import { createDepartment, getManagers } from "../api/HRApi";

export default function CreateDepartmentModal({ onClose, onRefresh }) {
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    departmentCode: "",
    departmentName: "",
    description: "",
    managerId: "", // Có thể để trống
  });

  // State quản lý UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // State quản lý danh sách Manager
  const [managers, setManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);

  // Lấy danh sách manager khi modal vừa được mở
  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoadingManagers(true);
      try {
        const data = await getManagers();
        setManagers(data); 
      } catch (err) {
        setError(err.response?.data?.message)
      } finally {
        setIsLoadingManagers(false);
      }
    };

    fetchManagers();
  }, []);

  // Xử lý khi người dùng gõ vào input hoặc chọn select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng bắt đầu sửa dữ liệu
    if (error) setError(null);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.departmentCode.trim() || !formData.departmentName.trim()) {
      setError("Mã và Tên phòng ban không được để trống!");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        managerId: formData.managerId ? parseInt(formData.managerId) : null,
      };

      await createDepartment(payload);
      
      onRefresh();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Đã xảy ra lỗi khi tạo phòng ban. Vui lòng thử lại!"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Thêm Phòng Ban Mới</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mã phòng ban <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                placeholder="VD: MKT, DEV, HR..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                maxLength={20}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Tên phòng ban <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="VD: Phòng Marketing"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Mô tả chức năng
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn gọn về chức năng của phòng ban..."
                rows="3"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
                maxLength={255}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Trưởng phòng (Tạm thời)
              </label>
              <select
                name="managerId"
                value={formData.managerId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
              >
                <option value="">-- Chọn Trưởng phòng  --</option>
                {isLoadingManagers ? (
                  <option value="" disabled>Đang tải danh sách...</option>
                ) : (
                  managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.employeeCode})
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                *Bạn có thể bổ nhiệm trưởng phòng sau khi phòng ban được duyệt.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang xử lý...
                </>
              ) : (
                "Lưu thông tin"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}