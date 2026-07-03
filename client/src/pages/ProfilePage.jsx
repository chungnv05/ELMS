import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { employeeMenu } from "../menus/Employee";
import { managerMenu } from "../menus/Manager";
import { hrMenu } from "../menus/HR"; 
import { getMyProfile } from "../api/Profile";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin cá nhân", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMenu = useMemo(() => {
    const role = localStorage.getItem("role");
    switch (role) {
      case "ROLE_HR_ADMIN":
        return hrMenu;
      case "ROLE_MANAGER":
        return managerMenu;
      case "ROLE_EMPLOYEE":
      default:
        return employeeMenu;
    }
  }, []);

  return (
    <DashboardLayout menuItems={currentMenu} pageTitle="Hồ Sơ Cá Nhân">
      <div className="p-6 flex justify-center">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 w-full bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profile && (
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
            
            {/* Header / Cover */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="px-8 pb-8 relative">
              {/* Avatar nổi lên trên cover */}
              <div className="w-24 h-24 bg-white rounded-full p-1.5 absolute -top-12 border border-slate-100 shadow-lg">
                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-4xl uppercase">
                  {profile.fullName.charAt(0)}
                </div>
              </div>

              {/* Nút Đổi mật khẩu tiện lợi */}
              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => navigate("/change-password")}
                  className="px-5 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition shadow-sm text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Đổi mật khẩu
                </button>
              </div>
              
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-slate-800">{profile.fullName}</h2>
                <p className="text-slate-500 font-medium mt-1">
                  Mã NV: {profile.empCode} &nbsp;•&nbsp; {profile.departmentName}
                </p>
              </div>
              
              <hr className="my-8 border-slate-100" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">Email</p>
                  <p className="text-slate-800 font-medium text-lg">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">Số điện thoại</p>
                  <p className="text-slate-800 font-medium text-lg">{profile.phoneNumber || "Chưa cập nhật"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">Vị trí</p>
                  <p className="text-indigo-700 font-bold bg-indigo-50 inline-block px-3 py-1 rounded-lg text-sm mt-1">
                    {profile.role}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-400 mb-1">Ngày bắt đầu làm</p>
                  <p className="text-slate-800 font-medium text-lg">{profile.hiredDate}</p>
                </div>
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-400 mb-1">Địa chỉ liên hệ</p>
                  <p className="text-slate-800 font-medium">{profile.address || "Chưa cập nhật địa chỉ"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}