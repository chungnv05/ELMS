import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { createLeaveRequest } from "../api/LeaveRequest";
import { getActiveLeaveTypes } from "../api/LeaveType";
import { employeeMenu } from "../menus/Employee";
import { hrMenu } from "../menus/HR";
import { managerMenu } from "../menus/Manager";
import { HLMMenu } from "../menus/HLM";

export default function CreateLeavePage() {
  const navigate = useNavigate();
  
  const [leaveTypes, setLeaveTypes] = useState([]);
  
  // formdata gửi lên server 
  const [formData, setFormData] = useState({
    typeId: "", 
    startDate: "",
    endDate: "",
    reason: "",
    evidenceFiles: null, // Lưu trữ danh sách file
  });

  const currentMenu = useMemo(() => {
    const role = localStorage.getItem("role");
    switch (role) {
      case "ROLE_HR_ADMIN":
        return hrMenu;
      case "ROLE_MANAGER":
        return managerMenu;
      case "ROLE_EMPLOYEE":
        return employeeMenu
      case "ROLE_HIGH_LEVEL_MANAGER":
        return HLMMenu;
    }
  }, []);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    getActiveLeaveTypes()
      .then((data) => {
        setLeaveTypes(data);
        if (data && data.length > 0) {
          // Gán giá trị mặc định cho typeId
          setFormData((prev) => ({ ...prev, typeId: data[0].typeId }));
        }
      })
      .catch(() => setError("Không thể tải danh sách loại nghỉ phép."));
  }, []);

  // Xử lý khi chọn file
  const handleFileChange = (e) => {
    setFormData({ ...formData, evidenceFiles: e.target.files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Ngày kết thúc không thể trước ngày bắt đầu.");
      return;
    }

    setLoading(true);

    // Chuyển đổi dữ liệu sang định dạng FormData để gửi file
    const submitData = new FormData();
    submitData.append("typeId", formData.typeId);
    submitData.append("startDate", formData.startDate);
    submitData.append("endDate", formData.endDate);
    submitData.append("reason", formData.reason);
    
    // Nếu có file đính kèm, lặp qua và append vào
    if (formData.evidenceFiles) {
      Array.from(formData.evidenceFiles).forEach((file) => {
        submitData.append("evidenceFiles", file);
      });
    }

    try {
      await createLeaveRequest(submitData); // Gửi đối tượng FormData
      setSuccess("Gửi đơn nghỉ phép thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout menuItems={currentMenu} pageTitle="Tạo Đơn Nghỉ Phép">
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mt-4">
        <div className="mb-8 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Đơn xin nghỉ phép</h2>
          <p className="text-sm text-slate-500 mt-1">
            Vui lòng điền thông tin và đính kèm minh chứng (nếu có).
          </p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">⚠️ {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Loại nghỉ phép</label>
            <select
              value={formData.typeId}
              onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              disabled={leaveTypes.length === 0}
            >
              {leaveTypes.map((type) => (
                <option key={type.typeId} value={type.typeId}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Từ ngày</label>
              <input
                type="date"
                min={today}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Đến ngày</label>
              <input
                type="date"
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lý do nghỉ</label>
            <textarea
              rows="3"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Ghi rõ lý do nghỉ..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              required
            ></textarea>
          </div>

          {/* Input Upload File mới thêm vào */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tài liệu minh chứng (Tùy chọn)
            </label>
            <input
              type="file"
              multiple // Cho phép chọn nhiều file theo List<MultipartFile>
              onChange={handleFileChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 
              file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold 
              file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
            />
            <p className="text-xs text-slate-400 mt-2">
              Có thể đính kèm ảnh chụp đơn thuốc, giấy khám bệnh... (Nếu cần)
            </p>
          </div>

          <div className="pt-5 flex justify-end gap-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate("/dashboard")} className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl">
              Hủy bỏ
            </button>
            <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl flex items-center gap-2">
              {loading ? "Đang gửi đơn..." : "Gửi đơn phép"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}