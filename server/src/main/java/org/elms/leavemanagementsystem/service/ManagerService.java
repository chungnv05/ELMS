package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.response.DepartmentStatsResponse;
import org.elms.leavemanagementsystem.dto.response.EmployeeResponse;
import org.elms.leavemanagementsystem.dto.response.LeaveEventResponse;
import org.elms.leavemanagementsystem.entity.Department;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.elms.leavemanagementsystem.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ManagerService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final DepartmentRepository departmentRepository;

    public ManagerService(EmployeeRepository employeeRepository,
                          LeaveRequestRepository leaveRequestRepository,
                          DepartmentRepository departmentRepository) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.departmentRepository = departmentRepository;
    }

    public DepartmentStatsResponse getDepartmentStats(Integer managerId) {
        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));


        Integer deptId = manager.getDepartment().getDepartmentID();

        long totalEmp = employeeRepository.countByDepartment_DepartmentIDAndIsActiveTrue(deptId);
        long pendingReq = leaveRequestRepository.countPendingRequestsByDepartment(deptId);
        long onLeaveToday = leaveRequestRepository.countEmployeesOnLeaveTodayByDepartment(deptId);

        return DepartmentStatsResponse.builder()
                .totalEmployees(totalEmp)
                .pendingRequests(pendingReq)
                .employeesOnLeaveToday(onLeaveToday)
                .build();
    }

    public List<LeaveEventResponse> getLeaveEvents(Integer managerId, int year, int month) {
        Employee manager = employeeRepository.findById(managerId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));


        Integer deptId = manager.getDepartment().getDepartmentID();

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startOfMonth = yearMonth.atDay(1);
        LocalDate endOfMonth = yearMonth.atEndOfMonth();

        List<LeaveRequest> leaves = leaveRequestRepository.findApprovedLeavesForMonth(deptId, startOfMonth, endOfMonth);

        return leaves.stream().map(leave -> LeaveEventResponse.builder()
                .fullName(leave.getEmployee().getFullName())
                .leaveTypeName(leave.getLeaveType().getName())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .build()
        ).collect(Collectors.toList());
    }

    // Lấy danh sách nhân viên của phòng ban
    public List<EmployeeResponse> getDepartmentEmployees(Employee manager) {
        Department department = departmentRepository.findByManager_EmpID(manager.getEmpID())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ban hợp lệ"));

        Integer departmentId = department.getDepartmentID();

        List<Employee> employees = employeeRepository.findByDepartment_DepartmentID(departmentId);

        return employees.stream().map(emp -> EmployeeResponse.builder()
                .empID(emp.getEmpID())
                .empCode(emp.getEmpCode())
                .fullName(emp.getFullName())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .departmentName(emp.getDepartment().getDepartmentName())
                .role(emp.getRole().name())
                .isActive(emp.getIsActive())
                .build()
        ).collect(Collectors.toList());
    }
}
