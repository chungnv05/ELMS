package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveApprovalRequest;
import org.elms.leavemanagementsystem.dto.response.LeaveRequestsResponse;
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
        Integer approverId = userDetails.getEmployee().getEmpID();

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
        Integer managerId = userDetails.getEmployee().getEmpID();

        // Gọi Service lấy danh sách
        List<LeaveRequestsResponse> requestList = leaveRequestService.getRequestsForManager(managerId, status);

        return ResponseEntity.ok(requestList);
    }



}