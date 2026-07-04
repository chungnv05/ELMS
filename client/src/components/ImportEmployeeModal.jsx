import React, { useState } from "react";
import { importEmployeesExcel } from "../api/HRApi"; // Import API

export default function ImportEmployeeModal({ onClose, onRefresh, showToast }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      await importEmployeesExcel(file);

      if (showToast) {
        showToast(`Thành công!`, "success");
      }

      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Lỗi khi upload file. Kiểm tra lại dữ liệu Excel.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="p-4 border-b font-bold flex justify-between items-center">
          <span>Nhập từ Excel</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        
        <div className="p-4">
          {error && <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          
          <p className="text-xs text-slate-500 mb-3">
            Vui lòng chuẩn bị file .xlsx với các cột: Mã NV, Họ tên, Email, Mật khẩu, ID Phòng ban, Vai trò (EMPLOYEE/MANAGER), SĐT, Ngày vào làm (YYYY-MM-DD), Địa chỉ.
          </p>
          
          <input 
            type="file" 
            accept=".xlsx" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="w-full text-sm border border-slate-200 p-2 rounded bg-slate-50" 
          />
        </div>
        
        <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-slate-100">
          <button onClick={onClose} disabled={isUploading} className="px-3 py-1.5 text-sm border border-slate-300 rounded hover:bg-white bg-transparent disabled:opacity-50">Hủy</button>
          <button onClick={handleUpload} disabled={!file || isUploading} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
            {isUploading ? "Đang xử lý..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}