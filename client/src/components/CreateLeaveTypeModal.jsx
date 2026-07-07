import React, { useState } from "react";
import { createLeaveType } from "../api/HRApi";

export default function CreateLeaveTypeModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({ 
    name: "", 
    isPaid: true, 
    requiresEvidence: false, 
    defaultDays: 0 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await createLeaveType(formData);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi lưu.");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert chuỗi (từ select) sang boolean
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value === 'true' });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
        
        <div className="p-5 border-b border-slate-100 flex justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-900">Thêm loại nghỉ phép</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>}
          
          <form id="leave-type-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên loại nghỉ <span className="text-red-500">*</span></label>
              <input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                placeholder="VD: Nghỉ ốm (Sick Leave)" 
                className="w-full p-2.5 border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hưởng lương? <span className="text-red-500">*</span></label>
                <select 
                  name="isPaid" 
                  value={formData.isPaid} 
                  onChange={handleSelectChange}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm bg-slate-50"
                >
                  <option value="true">Có hưởng lương</option>
                  <option value="false">Không hưởng lương</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Yêu cầu minh chứng? <span className="text-red-500">*</span></label>
                <select 
                  name="requiresEvidence" 
                  value={formData.requiresEvidence} 
                  onChange={handleSelectChange}
                  className="w-full p-2.5 border border-slate-300 rounded focus:border-indigo-500 outline-none text-sm bg-slate-50"
                >
                  <option value="false">Không bắt buộc</option>
                  <option value="true">Có (Cần upload ảnh/giấy tờ)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Quỹ ngày mặc định (Một năm) <span className="text-red-500">*</span></label>
              <input 
                type="number" min="0" required
                value={formData.defaultDays} 
                onChange={(e) => setFormData({...formData, defaultDays: parseInt(e.target.value) || 0})} 
                className="w-full p-2.5 border border-slate-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition"
              />
              <p className="text-xs text-slate-500 mt-1">Nhập 0 nếu loại phép này không giới hạn số ngày.</p>
            </div>
          </form>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
          <button onClick={onClose} type="button" className="px-5 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition">
            Hủy
          </button>
          <button form="leave-type-form" type="submit" disabled={isLoading} className="px-5 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-70 transition font-medium">
            {isLoading ? "Đang lưu..." : "Thêm mới"}
          </button>
        </div>

      </div>
    </div>
  );
}