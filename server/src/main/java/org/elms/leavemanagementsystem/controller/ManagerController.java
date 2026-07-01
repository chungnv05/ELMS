package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveApprovalRequest;
import org.elms.leavemanagementsystem.dto.response.LeaveRequestsResponse;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.LeaveApprovalService;
import org.elms.leavemanagementsystem.service.LeaveRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final LeaveApprovalService leaveApprovalService;
    private final LeaveRequestService leaveRequestService;

    public ManagerController(LeaveApprovalService leaveApprovalService,  LeaveRequestService leaveRequestService) {
        this.leaveApprovalService = leaveApprovalService;
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping("/leaves/process")
    public ResponseEntity<?> processLeave(@Valid @RequestBody LeaveApprovalRequest request, Authentication authentication) {
        // Lấy thông tin người dùng đang đăng nhập
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        Integer approverId = currentEmp.getEmpID();

        leaveApprovalService.processLeaveApproval(approverId, request);

        return ResponseEntity.ok(Map.of(
                "message", "Xử lý đơn nghỉ phép thành công!",
                "status", 200
        ));
    }

    @GetMapping("/leaves/list")
    public ResponseEntity<?> getManagerLeaveRequests(
            @RequestParam(required = false, defaultValue = "ALL") String status,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        Integer managerId = currentEmp.getEmpID();

        // Gọi Service lấy danh sách
        List<LeaveRequestsResponse> requestList = leaveRequestService.getRequestsForManager(managerId, status);

        return ResponseEntity.ok(requestList);
    }

    @GetMapping("/leaves/list/pending")
    public ResponseEntity<?> getManagerPendingRequests(
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        Integer managerId = currentEmp.getEmpID();

        // Gọi Service lấy danh sách
        List<LeaveRequestsResponse> requestList = leaveRequestService.getRequestsForManager(managerId, status);

        return ResponseEntity.ok(requestList);
    }



}