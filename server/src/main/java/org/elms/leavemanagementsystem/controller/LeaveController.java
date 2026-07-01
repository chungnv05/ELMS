package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.dto.response.LeaveRequestDetailResponse;
import org.elms.leavemanagementsystem.dto.response.LeaveTypeResponse;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.LeaveRequestService;
import org.elms.leavemanagementsystem.service.LeaveTypeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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

    // API lấy danh sách loại nghỉ phép
    @GetMapping("/types/active")
    public ResponseEntity<List<LeaveTypeResponse>> getLeaveTypes() {
        return ResponseEntity.ok(leaveTypeService.getActiveLeaveTypes());
    }

    // API tạo đơn
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createLeaveRequest(
            @Valid @ModelAttribute LeaveRequestForm form,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        Integer currentEmpID = currentEmp.getEmpID();
        leaveRequestService.createLeaveRequest(currentEmpID, form);

        return ResponseEntity.ok("Tạo đơn nghỉ phép thành công!");
    }

    @GetMapping("/{requestId}")
    public ResponseEntity<?> getLeaveRequestDetail(@PathVariable Integer requestId, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        LeaveRequestDetailResponse detailResponse = leaveRequestService.getLeaveRequestDetail(requestId, currentEmp.getEmpID(), role);
        return ResponseEntity.ok(detailResponse);
    }
}