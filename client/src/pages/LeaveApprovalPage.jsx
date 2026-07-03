import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import LeaveDetailModal from "../components/LeaveDetailModal";
import { getPendingLeaves, processLeaveRequest, getLeaveRequestDetail } from "../api/leaveRequest";
import { managerMenu } from "../menus/Manager";

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  const [processingId, setProcessingId] = useState(null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);


  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, reason: "" });

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const data = await getPendingLeaves();
      setLeaves(data);
    } catch (err) {
      showToast("Không thể tải danh sách đơn chờ duyệt.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleViewDetails = async (id) => {
    try {
      const data = await getLeaveRequestDetail(id);
      setSelectedLeave(data);
      setIsModalOpen(true);
    } catch (err) {
      showToast("Không thể tải chi tiết đơn.", "error");
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT đơn này?")) return;
    
    setProcessingId(id); 
    try {
      await processLeaveRequest({ requestId: id, action: "APPROVED" });
      showToast("Đã duyệt đơn thành công!", "success");
      fetchPendingLeaves();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi duyệt đơn.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Mở Modal từ chối
  const openRejectModal = (id) => {
    setRejectModal({ isOpen: true, requestId: id, reason: "" });
  };

  // Xác nhận từ chối từ Modal
  const submitReject = async () => {
    if (!rejectModal.reason.trim()) {
      showToast("Vui lòng nhập lý do từ chối!", "error");
      return;
    }

    const targetId = rejectModal.requestId;
    setRejectModal({ ...rejectModal, isOpen: false }); // Đóng modal ngay
    setProcessingId(targetId); // Hiển thị loading

    try {
      await processLeaveRequest({ requestId: targetId, action: "REJECTED", comment: rejectModal.reason });
      showToast("Đã từ chối đơn thành công!", "success");
      fetchPendingLeaves();
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi khi từ chối đơn.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout menuItems={managerMenu} pageTitle="Phê Duyệt Đơn Nghỉ Phép">
      
      {/* 1. THÀNH PHẦN TOAST NOTIFICATION CHUYÊN NGHIỆP */}
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 m-6 relative">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh sách chờ duyệt</h2>
            <p className="text-sm text-slate-500">Các đơn nghỉ phép cần Quản lý xác nhận.</p>
          </div>
          <button 
            onClick={fetchPendingLeaves} 
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
               <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : "↻ Làm mới"}
          </button>
        </div>

        {loading && leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
             <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-500 font-medium">Đang tải danh sách chờ duyệt...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="font-medium">Tuyệt vời! Hiện không có đơn nào cần duyệt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                  <th className="p-4 font-semibold rounded-tl-xl">Nhân viên</th>
                  <th className="p-4 font-semibold">Loại phép</th>
                  <th className="p-4 font-semibold">Thời gian</th>
                  <th className="p-4 font-semibold">Lý do</th>
                  <th className="p-4 font-semibold text-center rounded-tr-xl min-w-[280px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => {
                  const isProcessing = processingId === leave.requestId;
                  return (
                    <tr key={leave.requestId} className={`transition-colors ${isProcessing ? 'bg-slate-50 opacity-70' : 'hover:bg-slate-50/50'}`}>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{leave.employeeName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Mã: <span className="font-medium">{leave.requestCode}</span></p>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-700">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                          {leave.leaveTypeName}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5"><span className="text-slate-400 text-xs">Từ:</span> <span className="font-medium">{leave.startDate}</span></div>
                        <div className="flex items-center gap-1.5 mt-0.5"><span className="text-slate-400 text-xs">Đến:</span> <span className="font-medium">{leave.endDate}</span></div>
                        <div className="text-xs text-slate-400 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded-full">Tổng: {leave.totalDays} ngày</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(leave.requestId)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                          >
                            Chi tiết
                          </button>
                          <button 
                            onClick={() => handleApprove(leave.requestId)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-200 disabled:opacity-50 flex items-center justify-center min-w-[76px]"
                          >
                            {isProcessing ? <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Duyệt"}
                          </button>
                          <button 
                            onClick={() => openRejectModal(leave.requestId)}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-red-200 disabled:opacity-50 flex items-center justify-center min-w-[76px]"
                          >
                            {isProcessing ? <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Từ chối"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. MODAL NHẬP LÝ DO TỪ CHỐI */}
        {rejectModal.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Từ chối đơn nghỉ phép
                </h3>
                <button onClick={() => setRejectModal({ ...rejectModal, isOpen: false })} className="text-slate-400 hover:text-slate-700 text-2xl font-light">×</button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Lý do từ chối (Bắt buộc):</label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  placeholder="Nhập lý do để nhân viên hiểu vì sao đơn bị từ chối..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none resize-none text-slate-700"
                  rows="4"
                  autoFocus
                ></textarea>
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                    className="px-5 py-2.5 text-slate-600 font-semibold rounded-xl hover:bg-slate-100 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={submitReject}
                    className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                  >
                    Xác nhận Từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODAL CHI TIẾT ĐƠN */}
        {isModalOpen && selectedLeave && (
          <LeaveDetailModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            data={selectedLeave} 
          />
        )}
      </div>
    </DashboardLayout>
  );
}