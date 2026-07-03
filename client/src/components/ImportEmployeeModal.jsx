import React, { useState } from "react";

export default function ImportEmployeeModal({ onClose, onRefresh }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    // Logic gọi API upload file sẽ nằm ở đây
    alert("Đang xử lý file: " + file.name);
    setTimeout(() => {
      setIsUploading(false);
      onRefresh();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-fade-in-up">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Nhập từ Excel</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
        
        <div className="p-5">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              <p className="text-sm text-slate-500">{file ? file.name : "Chọn hoặc kéo thả file Excel"}</p>
            </div>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
          </label>
        </div>

        <div className="p-5 pt-0 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50">Hủy</button>
          <button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="px-4 py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isUploading ? "Đang xử lý..." : "Tải lên"}
          </button>
        </div>
      </div>
    </div>
  );
}