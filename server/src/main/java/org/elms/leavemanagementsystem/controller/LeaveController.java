package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.LeaveRequestService;
import org.elms.leavemanagementsystem.service.LeaveTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveTypeService leaveTypeService;

    public LeaveController(LeaveRequestService leaveRequestService, LeaveTypeService leaveTypeService) {
        this.leaveRequestService = leaveRequestService;
        this.leaveTypeService = leaveTypeService;
    }

    // 1. API lấy danh sách loại nghỉ phép (Angular sẽ gọi cái này để đổ vào dropdown)
    @GetMapping("/types")
    public ResponseEntity<List<LeaveType>> getLeaveTypes() {
        return ResponseEntity.ok(leaveTypeService.getActiveLeaveTypes());
    }

    // 2. API tạo đơn (Angular gọi POST tới đây)
    @PostMapping("/create")
    public ResponseEntity<?> submitLeaveRequest(
            @Valid @RequestBody LeaveRequestForm form,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        leaveRequestService.createLeaveRequest(currentEmp.getEmpID(), form);

        // API trả về JSON thay vì redirect
        return ResponseEntity.ok(Map.of("message", "Tạo đơn nghỉ phép thành công!"));
    }
}