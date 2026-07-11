package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveApprovalRequest;
import org.elms.leavemanagementsystem.dto.response.HLMStatsResponse;
import org.elms.leavemanagementsystem.dto.response.LeaveRequestsResponse;
import org.elms.leavemanagementsystem.dto.response.PendingApprovalResponse;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.HLMService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hlm")
public class HLMController {
    private final HLMService hlmService;

    public HLMController(HLMService hlmService) {
        this.hlmService = hlmService;
    }

    // API lấy thông số
    @GetMapping("/stats")
    public ResponseEntity<HLMStatsResponse> getStats(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        return ResponseEntity.ok(hlmService.getDashboardStats());
    }

    // API lấy danh sách chờ duyệt
    @GetMapping("/pending-approvals")
    public ResponseEntity<PendingApprovalResponse> getPendingApprovals(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        return ResponseEntity.ok(hlmService.getPendingApprovals());
    }

    // API duyệt / từ chối Phòng ban
    @PutMapping("/departments/{id}/approve")
    public ResponseEntity<?> approveDepartment(@PathVariable Integer id,
                                               @RequestParam boolean isApproved,
                                               Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        hlmService.approveDepartment(id, isApproved);
        String message = isApproved ? "Đã phê duyệt phòng ban thành công!" : "Đã từ chối phòng ban!";
        return ResponseEntity.ok(Map.of("message", message));
    }

    // API duyệt / từ chối Loại nghỉ phép
    @PutMapping("/leave-types/{id}/approve")
    public ResponseEntity<?> approveLeaveType(@PathVariable Integer id,
                                              @RequestParam boolean isApproved,
                                              Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        hlmService.approveLeaveType(id, isApproved);
        String message = isApproved ? "Đã phê duyệt loại nghỉ phép thành công!" : "Đã từ chối loại nghỉ phép!";
        return ResponseEntity.ok(Map.of("message", message));
    }

    // API lấy đơn nghỉ của manager và bộ phận nhân sự
    @GetMapping("/leave-requests")
    public ResponseEntity<?> getLeaveRequests(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        List<LeaveRequestsResponse> leaveRequests = hlmService.getLeaveRequestsForHLM(LeaveRequest.Status.PENDING);

        return ResponseEntity.ok(leaveRequests);
    }


}
