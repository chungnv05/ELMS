import React, { useState, useEffect } from 'react';
import { getLeaveRequestForUpdate, updateLeaveRequest } from '../api/LeaveRequest'; 
import { getActiveLeaveTypes } from "../api/LeaveType";

const UpdateLeaveRequest = ({ isOpen, onClose, requestId, onSuccess }) => {
  const [formData, setFormData] = useState({
    typeId: '', 
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [existingFiles, setExistingFiles] = useState([]); 
  const [deletedEvidenceIds, setDeletedEvidenceIds] = useState([]); 
  const [newFiles, setNewFiles] = useState([]); 
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setError("");
        setIsSuccess(false); 
    }
    if (isOpen && requestId) {
        fetchInitialData();
    }
    if (!isOpen) {
        setDeletedEvidenceIds([]);
        setNewFiles([]);
    }
  }, [isOpen, requestId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const types = await getActiveLeaveTypes();
      setLeaveTypes(types);

      const data = await getLeaveRequestForUpdate(requestId);
      
      setFormData({
        typeId: data.typeId || '', 
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        reason: data.reason || '',
      });
      
      setExistingFiles(data.evidenceFileIds || []);
    } catch (error) {
      setError(error.response?.data?.message || "Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(""); 
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingFile = (fileId) => {
    setDeletedEvidenceIds(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(id => id !== fileId)); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ trước khi submit
    
    // UX Nâng cao: Hiển thị lỗi ngay trên form thay vì alert
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
      return;
    }

    if (!formData.typeId) {
      setError("Vui lòng chọn loại nghỉ phép!");
      return;
    }

    setIsSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('typeId', formData.typeId);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('reason', formData.reason);
      
      deletedEvidenceIds.forEach(id => {
        submitData.append('deletedEvidenceIds', id);
      });

      newFiles.forEach(file => {
        submitData.append('newEvidenceFiles', file);
      });

      await updateLeaveRequest(requestId, submitData);

      setIsSuccess(true);
      
      setTimeout(() => {
        if (onSuccess) onSuccess(); 
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật đơn!");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden transition-all">
        
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900">Chỉnh sửa đơn nghỉ phép</h3>
          <button 
            onClick={onClose} 
            disabled={isSaving || isSuccess}
            className="text-slate-400 hover:text-slate-700 transition text-2xl font-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 relative">
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-16 animate-pulse">
               <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                 </svg>
               </div>
               <h3 className="text-2xl font-bold text-slate-800 mb-2">Cập nhật thành công!</h3>
               <p className="text-slate-500 font-medium">Đang quay lại chi tiết đơn...</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
               <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-slate-500 font-medium">Đang tải dữ liệu đơn...</p>
            </div>
          ) : (
            <>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3 animate-fade-in-down">
                <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-red-800">Không thể lưu đơn</h4>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form id="update-leave-form" onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loại nghỉ phép</label>
                <select 
                  name="typeId"
                  value={formData.typeId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 font-medium bg-white"
                >
                  <option value="" disabled>-- Chọn loại nghỉ phép --</option>
                  {leaveTypes.map(type => (
                    <option key={type.typeId} value={type.typeId}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Từ ngày</label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đến ngày</label>
                  <input 
                    type="date" 
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do nghỉ</label>
                <textarea 
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none resize-none text-slate-700"
                ></textarea>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-4">Tài liệu minh chứng</label>
                
                {existingFiles.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Minh chứng đã tải:</p>
                    {existingFiles.map((fileId, i) => (
                      <div key={fileId} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                          Minh chứng đính kèm {i + 1}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExistingFile(fileId)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition"
                        >
                          Xóa bỏ
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Thêm minh chứng mới:</p>
                  <input 
                    type="file" 
                    multiple
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition cursor-pointer"
                  />
                  {newFiles.length > 0 && (
                    <p className="text-sm text-emerald-600 mt-2 font-medium">
                      + Đã chọn {newFiles.length} file mới
                    </p>
                  )}
                </div>
              </div>

            </form>
            </>
          )}
        </div>

        {!isSuccess && (
          <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isLoading || isSaving}
              className="px-6 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button 
              form="update-leave-form"
              type="submit" 
              disabled={isLoading || isSaving}
              className="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:bg-indigo-300 flex items-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isSaving ? (
                <>
                  <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang lưu...
                </>
              ) : 'Lưu thay đổi'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpdateLeaveRequest;