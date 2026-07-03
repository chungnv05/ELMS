import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getUserProfile } from "../api/auth";

export default function Navbar({ title, toggleSidebar }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ fullName: "", empCode: "" });
  const navigate = useNavigate();

  useEffect(() => {
    getUserProfile()
      .then((data) => setUser(data))
      .catch((err) => console.error("Lỗi lấy thông tin:", err));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50">
      
      {/* 1. Phần bên trái: Nút Toggle và Tiêu đề trang */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      </div>

      {/* 2. Phần bên phải: User Profile + Nút Chuông */}
      <div className="flex items-center gap-4">
        
        {/* Khối User Profile */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="w-72 flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 focus:outline-none"
          >
            <div className="flex flex-col items-start px-2">
              <p className="text-xl font-semibold text-slate-800">{user.fullName || "Đang tải..."}</p>
              <p className="text-lg text-slate-400 uppercase tracking-wide">{user.empCode || "..."}</p>
            </div>
            
            {/* Avatar nằm bên phải trong nút bấm */}
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm text-xl">
              {user.fullName ? user.fullName.split(' ').pop()[0] : 'U'}
            </div>
          </button>

          {/* Dropdown Box */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
              
              {/* Header Dropdown */}
              <div className="p-5 bg-slate-50 border-b border-slate-100 w-full">
                <p className="text-base font-bold text-slate-800 truncate">{user.fullName}</p>
                <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
                  Mã NV: {user.empCode}
                </p>
              </div>

              {/* Menu Items */}
              <div className="p-3 space-y-1">
                <button 
                  onClick={() => { navigate("/profile"); setDropdownOpen(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-all font-medium"
                >
                  <span></span> Thông tin cá nhân
                </button>
                <button 
                  onClick={() => { navigate("/change-password"); setDropdownOpen(false); }} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-all font-medium"
                >
                  <span></span> Đổi mật khẩu
                </button>
                
                <div className="my-2 border-t border-slate-100"></div>
                
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold"
                >
                  <span></span> Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vạch kẻ dọc phân cách (Divider) */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        {/* Nút Chuông Thông Báo (Nằm ngoài cùng bên phải) */}
        <button 
          className="relative p-3 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-all focus:outline-none"
          title="Thông báo mới"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          {/* Hiệu ứng chấm đỏ (Ping) báo có thông báo */}
          <span className="absolute top-2.5 right-3 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
          </span>
        </button>

      </div>
    </header>
  );
}