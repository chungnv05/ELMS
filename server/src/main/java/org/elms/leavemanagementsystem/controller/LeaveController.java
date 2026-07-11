package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.LeaveApprovalRequest;
import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.dto.request.UpdateLeaveRequestForm;
import org.elms.leavemanagementsystem.dto.response.*;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.LeaveApprovalService;
import org.elms.leavemanagementsystem.service.LeaveBalanceService;
import org.elms.leavemanagementsystem.service.LeaveRequestService;
import org.elms.leavemanagementsystem.service.LeaveTypeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveRequestService leaveRequestService;
    private final LeaveTypeService leaveTypeService;
    private final LeaveBalanceService leaveBalanceService;
    private final LeaveApprovalService leaveApprovalService;

    public LeaveController(LeaveRequestService leaveRequestService,
                           LeaveTypeService leaveTypeService,
                           LeaveBalanceService leaveBalanceService,
                           LeaveApprovalService leaveApprovalService) {
        this.leaveRequestService = leaveRequestService;
        this.leaveTypeService = leaveTypeService;
        this.leaveBalanceService = leaveBalanceService;
        this.leaveApprovalService = leaveApprovalService;
    }

    // API lấy danh sách loại nghỉ phép đang hoạt động
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

    // API chi tiết đơn
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

    // API lấy thông tin đơn để cập nhật
    @GetMapping("/update/{requestId}")
    public ResponseEntity<?> getLeaveRequestForUpdate(@PathVariable Integer requestId, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        LeaveRequestForUpdate leaveRequestForUpdateesponse = leaveRequestService.getLeaveRequestForUpdate(requestId, currentEmp.getEmpID());
        return ResponseEntity.ok(leaveRequestForUpdateesponse);
    }

    // API cập nhật đơn
    @PutMapping(value = "/update/{requestId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateLeaveRequest(@PathVariable Integer requestId, @Valid @ModelAttribute UpdateLeaveRequestForm form, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer currentEmpId = userDetails.getEmployee().getEmpID();

        if (currentEmpId == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        leaveRequestService.updateLeaveRequest(requestId, form, currentEmpId);

        return ResponseEntity.ok().body("Cập nhật đơn nghỉ phép thành công!");
    }

    // API lấy quỹ nghỉ
    @GetMapping("/balance")
    public ResponseEntity<?> getLeaveBalance(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        int currentYear = Year.now().getValue();

        LeaveBalanceReponse leaveBalanceResponse = leaveBalanceService.getLeaveBalance(currentEmp.getEmpID(), currentYear);
        return ResponseEntity.ok(leaveBalanceResponse);
    }

    // API lấy list các đơn ở mọi trạng thái
    @GetMapping("/list")
    public ResponseEntity<?> getLeaveList(@RequestParam(required = false, defaultValue = "ALL") String status, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        List<LeaveRequestsResponse> leaveRequestsResponses = leaveRequestService.getLeaveRequestsForEmployee(currentEmp.getEmpID(), status);
        return ResponseEntity.ok(leaveRequestsResponses);
    }

    // API xóa đơn
    @DeleteMapping("/delete/{requestId}")
    public ResponseEntity<?> deleteLeaveRequest(
            @PathVariable Integer requestId,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer currentEmpId = userDetails.getEmployee().getEmpID();

        leaveRequestService.deleteLeaveRequest(requestId, currentEmpId);

        return ResponseEntity.ok(Collections.singletonMap("message", "Đã xóa đơn nghỉ phép thành công!"));
    }

    // API lấy lịch theo tháng
    @GetMapping("/personal-calendar")
    public ResponseEntity<?> getUserCalendar(
            @RequestParam int year,
            @RequestParam int month,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Integer currentEmpId = userDetails.getEmployee().getEmpID();

        if (currentEmpId == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        List<LeaveEventResponse> events = leaveRequestService.getUserCalendar(currentEmpId, year, month);
        return ResponseEntity.ok(events);
    }

    // API duyệt đơn dùng cho HLM và manager
    @PostMapping("/process")
    public ResponseEntity<?> processLeave(@Valid @RequestBody LeaveApprovalRequest request, Authentication authentication) {
        // Lấy thông tin người dùng đang đăng nhập
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }


        if (currentEmp.getRole() != Employee.Role.MANAGER &&
                currentEmp.getRole() != Employee.Role.HIGH_LEVEL_MANAGER) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        Integer approverId = currentEmp.getEmpID();

        leaveApprovalService.processLeaveApproval(approverId, request);

        return ResponseEntity.ok(Map.of(
                "message", "Xử lý đơn nghỉ phép thành công!",
                "status", 200
        ));
    }

}