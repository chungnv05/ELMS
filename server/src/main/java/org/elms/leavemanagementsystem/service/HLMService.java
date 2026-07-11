package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.response.*;
import org.elms.leavemanagementsystem.entity.Department;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.elms.leavemanagementsystem.repository.LeaveRequestRepository;
import org.elms.leavemanagementsystem.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import static org.elms.leavemanagementsystem.entity.Department.ApprovalStatus.APPROVED;
import static org.elms.leavemanagementsystem.entity.Department.ApprovalStatus.REJECTED;

@Service
public class HLMService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public HLMService(EmployeeRepository employeeRepository,
                      DepartmentRepository departmentRepository,
                      LeaveTypeRepository leaveTypeRepository,
                      LeaveRequestRepository leaveRequestRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }


    // Lấy thông số thống kê tổng
    public HLMStatsResponse getDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long activeDepartments = departmentRepository.countByIsActiveTrue();

        // Đếm tổng số yêu cầu chờ duyệt
        long pendingDepts = departmentRepository.countByApprovalStatus(Department.ApprovalStatus.PENDING);
        long pendingLeaves = leaveTypeRepository.countByStatus(LeaveType.Status.PENDING);

        return HLMStatsResponse.builder()
                .totalEmployees(totalEmployees)
                .activeDepartments(activeDepartments)
                .pendingRequests(pendingDepts + pendingLeaves)
                .build();
    }

    // Lấy danh sách chờ duyệt (Phòng ban & Loại nghỉ phép)
    public PendingApprovalResponse getPendingApprovals() {
        List<Department> pendingDepts = departmentRepository.findByApprovalStatus(Department.ApprovalStatus.PENDING);
        List<LeaveType> pendingLeaves = leaveTypeRepository.findByStatus(LeaveType.Status.PENDING);

        // Map sang DTO để trả về cho Frontend
        List<DepartmentResponse> deptResponses = pendingDepts.stream().map(dept ->
                DepartmentResponse.builder()
                        .departmentID(dept.getDepartmentID())
                        .departmentCode(dept.getDepartmentCode())
                        .managerName(dept.getManager().getFullName())
                        .departmentName(dept.getDepartmentName())
                        .approvalStatus(dept.getApprovalStatus().name())
                        .active(dept.getIsActive())
                        .build()
        ).collect(Collectors.toList());

        List<LeaveTypeResponse> leaveResponses = pendingLeaves.stream().map(leave ->
                LeaveTypeResponse.builder()
                        .typeId(leave.getTypeID())
                        .name(leave.getName())
                        .isPaid(leave.getIsPaid())
                        .build()
        ).collect(Collectors.toList());

        return PendingApprovalResponse.builder()
                .departments(deptResponses)
                .leaveTypes(leaveResponses)
                .build();
    }

    // Xử lý duyệt / từ chối thêm phòng ban
    @Transactional
    public void approveDepartment(Integer id, boolean isApproved) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ban!"));

        dept.setApprovalStatus(isApproved ? APPROVED : REJECTED);
        // Nếu duyệt, tự động bật trạng thái hoạt động (Active)
        if (isApproved) {
            dept.setIsActive(true);
        }

        departmentRepository.save(dept);
    }

    // Xử lý duyệt / từ chối thêm loại nghỉ phép
    @Transactional
    public void approveLeaveType(Integer id, boolean isApproved) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại nghỉ phép!"));

        leaveType.setStatus(isApproved ? LeaveType.Status.APPROVED : LeaveType.Status.REJECTED);
        if (isApproved) {
            leaveType.setIsActive(true);
        }

        leaveTypeRepository.save(leaveType);
    }

    public List<LeaveRequestsResponse> getLeaveRequestsForHLM(LeaveRequest.Status status) {
        List<Employee.Role> targetRoles = List.of(
                Employee.Role.MANAGER,
                Employee.Role.HR_ADMIN
        );

        List<LeaveRequest> requests = leaveRequestRepository.findRequestsByEmployeeRoles(targetRoles, status);

        return requests.stream().map(req ->
                LeaveRequestsResponse.builder()
                        .requestId(req.getRequestID())
                        .requestCode(req.getRequestCode())
                        .employeeName(req.getEmployee().getFullName())
                        .leaveTypeName(req.getLeaveType().getName())
                        .startDate(req.getStartDate())
                        .endDate(req.getEndDate())
                        .totalDays(req.getTotalDays())
                        .reason(req.getReason())
                        .status(req.getStatus().name())
                        .createdAt(req.getCreatedAt())
                        .build()
        ).collect(Collectors.toList());

    }
}
