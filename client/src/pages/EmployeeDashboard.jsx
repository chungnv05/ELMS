import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { employeeMenu } from "../menus/Employee";



export default function EmployeeDashboard() {
  return (
    <DashboardLayout 
      menuItems={employeeMenu}  
      pageTitle="Tổng quan Cá nhân"
    >
      {/* Hàng 1: Các thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng phép năm" value="12 ngày" 
          bgColorClass="bg-blue-50 text-blue-600" colorClass="text-slate-800"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard 
          title="Đã sử dụng" value="3.5 ngày" 
          bgColorClass="bg-emerald-50 text-emerald-600" colorClass="text-slate-800"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard 
          title="Đang chờ duyệt" value="1 ngày" 
          bgColorClass="bg-amber-50 text-amber-600" colorClass="text-slate-800"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Phép còn lại" value="7.5 ngày" 
          bgColorClass="bg-purple-50 text-purple-600" colorClass="text-purple-700"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
      </div>

      {/* Hàng 2: Bảng dữ liệu mẫu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Đơn nghỉ gần đây</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Tạo đơn mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Mã đơn</th>
                <th className="px-6 py-4">Loại phép</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">LR-2026-001</td>
                <td className="px-6 py-4 text-slate-600">Phép năm</td>
                <td className="px-6 py-4 text-slate-600">10/07/2026 - 12/07/2026</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Chờ duyệt</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}