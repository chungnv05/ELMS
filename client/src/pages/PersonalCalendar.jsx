import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { employeeMenu } from "../menus/Employee";
import { getMyCalendar } from "../api/LeaveRequest";

export default function PersonalCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [error, setError] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() trả về 0-11

  useEffect(() => {
    fetchCalendarEvents();
  }, [year, month]);

  const fetchCalendarEvents = async () => {
    setIsLoading(true);
    setError(null); // Xóa lỗi cũ trước khi gọi API mới
    try {
      const data = await getMyCalendar(year, month);
      setEvents(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch:", err);
      setError(err.response?.data?.message || "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startingDay }, (_, i) => i);

  const getEventsForDay = (day) => {
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = new Date(formattedDate);

    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);
      dateObj.setHours(0,0,0,0);
      return dateObj >= start && dateObj <= end;
    });
  };

  const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

  return (
    <DashboardLayout menuItems={employeeMenu} pageTitle="Lịch Nghỉ Phép Cá Nhân">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden m-6 p-8 relative min-h-[600px] flex flex-col">
        
        {/* Header Lịch */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Tháng {month}, Năm {year}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrevMonth}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition text-slate-500 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={handleNextMonth}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition text-slate-500 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* VÙNG RENDER NỘI DUNG CHÍNH (LOADING / ERROR / CALENDAR GRID) */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin shadow-sm"></div>
              <p className="text-slate-500 mt-5 font-medium animate-pulse">Đang đồng bộ dữ liệu lịch...</p>
            </div>
          ) : error ? (
            /* UX/UI ERROR STATE SIÊU ĐẸP */
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-red-50/30 border border-red-100 border-dashed rounded-2xl animate-fade-in-up">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-red-50">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa thể tải lịch</h3>
              <p className="text-slate-500 mb-8 text-center max-w-md leading-relaxed">{error}</p>
              <button 
                onClick={fetchCalendarEvents}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tải lại dữ liệu
              </button>
            </div>
          ) : (
            /* KHUNG GRID LỊCH THỰC TẾ */
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 flex-1 flex flex-col animate-fade-in">
              {/* Hàng Tên Thứ */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/70">
                {dayNames.map(day => (
                  <div key={day} className="py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>

              {/* Các ô Ngày */}
              <div className="grid grid-cols-7 bg-slate-200 gap-px flex-1">
                {/* Các ô trống đầu tháng */}
                {blanksArray.map(blank => (
                  <div key={`blank-${blank}`} className="bg-white/50 min-h-[120px] p-2"></div>
                ))}

                {/* Các ngày thực tế */}
                {daysArray.map(day => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = new Date().getDate() === day && new Date().getMonth() + 1 === month && new Date().getFullYear() === year;

                  return (
                    <div key={day} className="bg-white min-h-[120px] p-3 flex flex-col group hover:bg-slate-50 transition-colors relative">
                      {/* Hiển thị số ngày */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                          isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-100 ring-offset-1' : 'text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50'
                        }`}>
                          {day}
                        </span>
                      </div>

                      {/* Hiển thị Sự kiện (Đơn nghỉ phép) */}
                      <div className="flex flex-col gap-1.5 flex-1">
                        {dayEvents.map((evt, idx) => (
                          <div 
                            key={idx} 
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold truncate border-l-4 shadow-sm transition-all hover:scale-[1.02] cursor-default ${
                              evt.status === 'APPROVED' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-500' 
                                : 'bg-amber-50 text-amber-700 border-amber-500'
                            }`}
                            title={`${evt.leaveTypeName} (${evt.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'})`}
                          >
                            {evt.leaveTypeName}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chú thích màu sắc (Chỉ hiện khi load xong và không có lỗi) */}
        {!isLoading && !error && (
          <div className="mt-6 flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
              <div className="w-5 h-5 rounded-md bg-amber-50 border-l-4 border-amber-500 shadow-sm"></div>
              Đang chờ duyệt
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
              <div className="w-5 h-5 rounded-md bg-emerald-50 border-l-4 border-emerald-500 shadow-sm"></div>
              Đã được duyệt
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}