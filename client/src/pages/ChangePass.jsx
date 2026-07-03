import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { employeeMenu } from "../menus/Employee";
import { changePassword } from "../api/Profile";
import { useNavigate } from "react-router-dom";

export default function ChangePass() {
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [isChanging, setIsChanging] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp!", "error");
      return;
    }
    
    setIsChanging(true);
    try {
      await changePassword(passwordForm);
      showToast("Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới ngay.", "success");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Có thể tùy chọn: Đăng xuất người dùng hoặc chuyển về trang Profile sau 2s
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error) {
      showToast(error.response?.data?.message || "Đổi mật khẩu thất bại, vui lòng kiểm tra lại", "error");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <DashboardLayout menuItems={employeeMenu} pageTitle="Đổi Mật Khẩu">
      
      {/* Toast Notification */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-300 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          <p className="font-semibold text-sm">{toast.message}</p>
        </div>
      </div>

      <div className="p-6 flex justify-center">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
          
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Bảo mật tài khoản</h3>
              <p className="text-sm text-slate-500">Cập nhật mật khẩu để bảo vệ dữ liệu của bạn</p>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={submitChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu hiện tại</label>
                <input 
                  type="password" name="currentPassword" required
                  placeholder="Nhập mật khẩu cũ..."
                  value={passwordForm.currentPassword} onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 bg-slate-50 focus:bg-white"
                />
              </div>
              
              <hr className="border-slate-100 my-4" />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu mới</label>
                <input 
                  type="password" name="newPassword" required minLength="6"
                  placeholder="Mật khẩu phải có ít nhất 6 ký tự"
                  value={passwordForm.newPassword} onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 bg-slate-50 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Xác nhận mật khẩu mới</label>
                <input 
                  type="password" name="confirmPassword" required minLength="6"
                  placeholder="Nhập lại mật khẩu mới..."
                  value={passwordForm.confirmPassword} onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none text-slate-700 bg-slate-50 focus:bg-white"
                />
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => navigate("/profile")}
                  disabled={isChanging}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" disabled={isChanging}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-70 flex justify-center items-center gap-2 min-w-[160px]"
                >
                  {isChanging ? (
                    <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}