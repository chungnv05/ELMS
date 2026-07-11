import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { hrMenu } from "../menus/HR";
import { getCompanyStats, exportLeaveBalanceReport, exportLeaveRequestReport } from "../api/HRApi"; 

export default function HRDashboard() {

  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartment: 0,
    pendingRequests: 0,
    onLeaveToday: 0,
    requestsThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const [reportType, setReportType] = useState("BALANCE"); 
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isExporting, setIsExporting] = useState(false);
  

  const [exportError, setExportError] = useState(null); 


  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCompanyStats(); 
      setStats(data);
    } catch (err) {
      console.error("Lỗi tải thống kê HR:", err);
      // Ưu tiên lấy lỗi từ backend, nếu không có mới dùng lỗi mặc định
      setError(err.response?.data?.message || "Không thể tải dữ liệu thống kê thực tế từ hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  // === LOGIC XUẤT FILE EXCEL ===
  const handleDownload = (data, filename) => {
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExport = async () => {
    setExportError(null); 
    setIsExporting(true);
    
    try {
      if (reportType === "BALANCE") {
        const data = await exportLeaveBalanceReport();
        handleDownload(data, "Bao_Cao_Quy_Phep.xlsx");
      } 
      else if (reportType === "REQUESTS") {
        if (!dateRange.startDate || !dateRange.endDate) {
          setExportError("Yêu cầu chọn khoảng thời gian");
          setIsExporting(false);
          return;
        }
        
        // Cảnh báo thêm UX: Ngày kết thúc không được nhỏ hơn ngày bắt đầu
        if (new Date(dateRange.endDate) < new Date(dateRange.startDate)) {
           setExportError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
           setIsExporting(false);
           return;
        }

        const data = await exportLeaveRequestReport(dateRange.startDate, dateRange.endDate);
        handleDownload(data, `Chi_Tiet_Nghi_Phep_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
      }
    } catch (error) {
      console.error("Lỗi khi xuất file:", error);
      // Xử lý lỗi xuất file (đặc biệt khi Blob trả về lỗi)
      if (error.response && error.response.data instanceof Blob) {
        // Đọc nội dung JSON từ Blob lỗi
        const text = await error.response.data.text();
        try {
          const errData = JSON.parse(text);
          setExportError(errData.message || "Xuất dữ liệu thất bại!");
        } catch (e) {
          setExportError("Xuất dữ liệu thất bại. Lỗi định dạng tệp trả về.");
        }
      } else {
        setExportError(error.response?.data?.message || "Xuất dữ liệu thất bại. Vui lòng kiểm tra lại kết nối!");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout menuItems={hrMenu} pageTitle="Trung tâm Điều hành HR">
      <div className="m-6 space-y-6">
        
        {/* === PHẦN 1: THỐNG KÊ TỔNG QUAN === */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Đang đồng bộ dữ liệu điều hành...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-red-50/50 border border-red-100 border-dashed rounded-2xl animate-fade-in-up">
            <svg className="w-12 h-12 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-slate-600 font-medium mb-4">{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard title="Tổng nhân sự" value={stats.totalEmployees.toString()} bgColorClass="bg-blue-50 text-blue-600" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
            <StatCard title="Tổng phòng ban" value={stats.totalDepartment.toString()} bgColorClass="bg-teal-50 text-teal-600" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
            <StatCard title="Đơn PENDING" value={stats.pendingRequests.toString()} bgColorClass="bg-red-50 text-red-600" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            <StatCard title="Nghỉ phép hôm nay" value={stats.onLeaveToday.toString()} bgColorClass="bg-amber-50 text-amber-600" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <StatCard title="Số đơn tháng này" value={stats.requestsThisMonth.toString()} bgColorClass="bg-violet-50 text-violet-600" icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          </div>
        )}

        {/* === PHẦN 2: TRÍCH XUẤT EXCEL TÍCH HỢP === */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up relative">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Trích xuất Báo cáo (Excel)</h2>
            <p className="text-sm text-slate-500 mt-1">Xuất dữ liệu quỹ phép và lịch sử nghỉ phép của toàn bộ nhân viên</p>
          </div>
          
          <div className="p-6">
            
            {/* THÔNG BÁO LỖI UX CHO BÁO CÁO MỚI THÊM Ở ĐÂY */}
            {exportError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-start gap-3 animate-fade-in">
                <svg className="w-5 h-5 mt-0.5 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Không thể trích xuất file</p>
                  <p className="text-sm text-rose-600">{exportError}</p>
                </div>
                <button 
                  onClick={() => setExportError(null)} 
                  className="text-rose-400 hover:text-rose-600 transition p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              {/* Chọn loại báo cáo */}
              <div className="md:col-span-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Loại báo cáo</label>
                <select 
                  value={reportType} 
                  onChange={(e) => {
                    setReportType(e.target.value);
                    setExportError(null); // Tự động clear lỗi khi đổi loại báo cáo
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="BALANCE">1. Báo cáo Tổng hợp Quỹ phép nhân viên</option>
                  <option value="REQUESTS">2. Báo cáo Chi tiết Lịch sử Nghỉ phép</option>
                </select>
              </div>

              {/* Các ô Date (Chỉ hiện khi chọn báo cáo lịch sử) */}
              <div className="md:col-span-4 flex gap-3">
                {reportType === "REQUESTS" ? (
                  <>
                    <div className="flex-1 animate-fade-in">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Từ ngày</label>
                      <input 
                        type="date" 
                        value={dateRange.startDate}
                        onChange={(e) => {
                          setDateRange({...dateRange, startDate: e.target.value});
                          setExportError(null); 
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div className="flex-1 animate-fade-in">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Đến ngày</label>
                      <input 
                        type="date" 
                        value={dateRange.endDate}
                        onChange={(e) => {
                          setDateRange({...dateRange, endDate: e.target.value});
                          setExportError(null);
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </>
                ) : (
                  <div className="w-full text-sm text-slate-400 italic mb-2">
                    *Báo cáo này xuất tổng quỹ phép khả dụng hiện tại, không yêu cầu chọn ngày.
                  </div>
                )}
              </div>

              {/* Nút Xuất Excel */}
              <div className="md:col-span-3">
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex justify-center items-center gap-2 disabled:opacity-70 shadow-sm disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isExporting ? "Đang xử lý..." : "Xuất File"}
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}