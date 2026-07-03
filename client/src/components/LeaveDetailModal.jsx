import React, { useState, useEffect } from 'react';
import { handleDownload } from "../api/FileApi";
import UpdateLeaveRequest from './UpdateLeaveRequest';
import { getLeaveRequestDetail } from "../api/LeaveRequest"

const LeaveDetailModal = ({ isOpen, onClose, data, onRefreshList }) => {
  const [isEditing, setIsEditing] = useState(false);

  const leaveData = data;

  if (!isOpen || !leaveData) return null;


  if (isEditing) {
    return (
      <UpdateLeaveRequest 
        isOpen={isEditing}
        requestId={leaveData.requestId}
        onClose={() => setIsEditing(false)} 
        onSuccess={async () => {
          setIsEditing(false);
          if(onRefreshList){
            await onRefreshList();
          }
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-[95%] max-w-7xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Chi tiết đơn nghỉ phép</h3>
            <p className="text-slate-500 mt-1 font-medium">Mã đơn: <span className="text-indigo-600">{leaveData.requestCode}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition text-3xl font-light">×</button>
        </div>

        <div className="p-10 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            <div className="lg:col-span-2 space-y-10">
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600">
                  {leaveData.employeeName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800">{leaveData.employeeName}</h4>
                  <p className="text-slate-500">Mã nhân viên: {leaveData.employeeCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                   <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Loại nghỉ phép</p>
                   <p className="text-lg font-bold text-slate-800">{leaveData.leaveTypeName}</p>
                </div>
                <div>
                   <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Tổng thời gian</p>
                   <p className="text-lg font-bold text-indigo-600">{leaveData.totalDays} ngày</p>
                </div>
                <div className="col-span-2">
                   <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Thời gian nghỉ</p>
                   <p className="text-lg font-semibold text-slate-700">{leaveData.startDate} đến {leaveData.endDate}</p>
                </div>
                <div className="col-span-2">
                   <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">Lý do</p>
                   <p className="text-base text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-xl border border-slate-100 italic">"{leaveData.reason}"</p>
                </div>
              </div>
            </div>

            <div className="space-y-10 border-l border-slate-100 pl-12">
              <section>
                <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-4">Tài liệu đính kèm</p>
                {leaveData.evidenceFiles?.length > 0 ? (
                  leaveData.evidenceFiles.map((f, i) => (
                    <button 
                      key={`file-${i}`}
                      onClick={() => handleDownload(f)}
                      className="block w-full p-3 mb-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition text-left"
                    >
                      Minh chứng {i + 1}
                    </button>
                  ))
                ) : <p className="text-sm text-slate-400 italic">Không có tài liệu</p>}
              </section>

              <section>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Lịch sử phê duyệt</p>
                <div className="space-y-6">
                  {leaveData.approvalHistories.map((h, i) => (
                    <div key={`hist-${i}`} className="flex gap-4">
                      <div className={`w-3 h-3 mt-1.5 rounded-full ${h.action === 'APPROVED' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{h.approverName}</p>
                        <p className="text-xs text-slate-500">{h.action} · {new Date(h.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="px-10 py-6 border-t border-slate-100 flex justify-between items-center bg-slate-50">
          <div className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${leaveData.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200'}`}>
             Trạng thái: {leaveData.status}
          </div>
          
          <div className="flex gap-3">
            {leaveData.owner && leaveData.status === "PENDING" && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Chỉnh sửa đơn
              </button>
            )}
            <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailModal;