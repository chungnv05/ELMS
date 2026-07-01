import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import LeaveDetailModal from "../components/LeaveDetailModal"
import { getPendingLeaves, processLeaveRequest, getLeaveRequestDetail } from "../api/leaveRequest";
import { managerMenu } from "../menus/Manager";

export default function LeaveApprovalPage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const data = await getPendingLeaves();
      setLeaves(data);
    } catch (err) {
      setError("Không thể tải danh sách đơn chờ duyệt.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const data = await getLeaveRequestDetail(id);
      setSelectedLeave(data);
      setIsModalOpen(true);
    } catch (err) {
      alert("Không thể tải chi tiết đơn.");
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn DUYỆT đơn này?")) return;
    try {
      await processLeaveRequest({ requestId: id, action: "APPROVED" });
      alert("Đã duyệt đơn thành công!");
      fetchPendingLeaves();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Vui lòng nhập lý do từ chối đơn này:");
    if (reason === null) return;

    try {
      await processLeaveRequest({ requestId: id, action: "REJECTED", comment: reason });
      alert("Đã từ chối đơn thành công!");
      fetchPendingLeaves();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi từ chối đơn.");
    }
  };


  return (
    <DashboardLayout menuItems={managerMenu} pageTitle="Phê Duyệt Đơn Nghỉ Phép">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 m-6">
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Danh sách chờ duyệt</h2>
            <p className="text-sm text-slate-500">Các đơn nghỉ phép cần Quản lý xác nhận.</p>
          </div>
          <button onClick={fetchPendingLeaves} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all">
            ↻ Làm mới
          </button>
        </div>

        {error && <div className="p-4 mb-4 text-red-600 bg-red-50 rounded-lg">{error}</div>}

        {loading ? (
          <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            Hiện không có đơn nào cần duyệt.
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
                {leaves.map((leave) => (
                  <tr key={leave.requestId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{leave.employeeName}</p>
                      <p className="text-xs text-slate-500">Mã đơn: {leave.requestCode}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-700">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                        {leave.leaveTypeName}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>Từ: <span className="font-medium">{leave.startDate}</span></div>
                      <div>Đến: <span className="font-medium">{leave.endDate}</span></div>
                      <div className="text-xs text-slate-400 mt-1">({leave.totalDays} ngày)</div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      {/* Nút Xem chi tiết mới thêm */}
                      <button 
                        onClick={() => handleViewDetails(leave.requestId)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                      >
                        Chi tiết
                      </button>

                      <button 
                        onClick={() => handleApprove(leave.requestId)}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                      >
                        ✓ Duyệt
                      </button>
                      <button 
                        onClick={() => handleReject(leave.requestId)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                      >
                        ✕ Từ chối
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isModalOpen && selectedLeave && (
              <LeaveDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} // Khi đóng, reset lại modal
                data={selectedLeave} 
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}