import EmployeeDashboard from "./EmployeeDashboard";
import ManagerDashboard from "./ManagerDashBoard"; 
import HRDashboard from "./HRDashboard"; 
import HLMDashboard from "./HLMDashboard";

export default function DashboardRouter() {
  const role = localStorage.getItem("role");

  switch (role) {
    case "ROLE_HIGH_LEVEL_MANAGER":
      return <HLMDashboard />;
    case "ROLE_HR_ADMIN":
      return <HRDashboard />; 
    case "ROLE_MANAGER":
      return <ManagerDashboard />; 
    case "ROLE_EMPLOYEE":
      return <EmployeeDashboard />;
  }
}