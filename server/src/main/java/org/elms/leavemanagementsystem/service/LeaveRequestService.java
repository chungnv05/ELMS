package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.dto.response.LeaveRequestsResponse;
import org.elms.leavemanagementsystem.entity.*;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.FileStorageException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.swing.plaf.PanelUI;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final ApprovalHistoryService approvalHistoryService;
    private final EmployeeService employeeService;
    private final LeaveTypeService leaveTypeService;
    private final LeaveEvidenceService leaveEvidenceService;



    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               LeaveBalanceService leaveBalanceService,
                               ApprovalHistoryService approvalHistoryService,
                               EmployeeService employeeService,
                               LeaveTypeService leaveTypeService,
                               LeaveEvidenceService leaveEvidenceService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.approvalHistoryService = approvalHistoryService;
        this.employeeService = employeeService;
        this.leaveTypeService = leaveTypeService;
        this.leaveEvidenceService = leaveEvidenceService;

    }

    public LeaveRequest getLeaveRequestById(Integer id) {
        return leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn nghỉ phép phù hợp"));

    }

    @Transactional
    public void createLeaveRequest(Integer currentEmpId, LeaveRequestForm form) {

        // Lấy thông tin Employee và LeaveType
        Employee employee = employeeService.getEmployeeById(currentEmpId);
        LeaveType type = leaveTypeService.getLeaveTypeById(form.getTypeId());

        // Validate thời gian hợp lệ
        if (form.getStartDate().isAfter(form.getEndDate())) {
            throw new BusinessException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }

        // Kiểm tra trùng lịch
        List<LeaveRequest> overlappingRequests = leaveRequestRepository.findOverlappingRequests(currentEmpId, form.getStartDate(), form.getEndDate());
        if (!overlappingRequests.isEmpty()) {
            throw new BusinessException("Bạn đã có đơn nghỉ phép khác trong khoảng thời gian này!");
        }

        // Bắt buộc có minh chứng nếu loại nghỉ phép yêu cầu
        if (Boolean.TRUE.equals(type.getRequiresEvidence())) {
            if (form.getEvidenceFiles() == null || form.getEvidenceFiles().isEmpty() || form.getEvidenceFiles().get(0).isEmpty()) {
                throw new BusinessException("Loại nghỉ phép '" + type.getName() + "' bắt buộc phải nộp giấy tờ minh chứng!");
            }
        }

        // Tính số ngày nghỉ
        long daysBetween = ChronoUnit.DAYS.between(form.getStartDate(), form.getEndDate()) + 1;
        BigDecimal requestDays = BigDecimal.valueOf(daysBetween);

        if (requestDays.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số ngày xin nghỉ không hợp lệ!");
        }

        // Kiểm tra quỹ phép
        int currentYear = Year.now().getValue();
        leaveBalanceService.updatePendingDays(currentEmpId, currentYear, requestDays);

        LocalDateTime now = LocalDateTime.now();
        LeaveRequest request = new LeaveRequest();
        request.setRequestCode("LR-" + currentYear + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        request.setEmployee(employee);
        request.setLeaveType(type);
        request.setStartDate(form.getStartDate());
        request.setEndDate(form.getEndDate());
        request.setTotalDays(requestDays);
        request.setReason(form.getReason());
        request.setStatus(LeaveRequest.Status.PENDING);
        request.setCreatedAt(now);
        request.setUpdatedAt(now);

        // Lưu trước vào db để có ID tham chiếu cho evidence và history
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        //  Xử lý File đính kèm
        leaveEvidenceService.saveEvidence(form, savedRequest);

        // Ghi vào ApprovalHistory
        approvalHistoryService.createFirstHistory(
                savedRequest,
                employee,
                ApprovalHistory.Action.SUBMITTED,
                LeaveRequest.Status.PENDING,
                "Tạo đơn nghỉ phép mới");
    }

    public List<LeaveRequestsResponse> getRequestsForManager(Integer managerId, String statusString) {
        LeaveRequest.Status statusEnum = null;

        if (statusString != null && !statusString.equalsIgnoreCase("ALL") && !statusString.trim().isEmpty()) {
            try {
                statusEnum = LeaveRequest.Status.valueOf(statusString.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessException("Trạng thái đơn không hợp lệ!");
            }
        }

        List<LeaveRequest> requests = leaveRequestRepository.findRequestsForManager(managerId, statusEnum);

        return requests.stream().map(request -> LeaveRequestsResponse.builder()
                .requestId(request.getRequestID())
                .requestCode(request.getRequestCode())
                .employeeName(request.getEmployee().getFullName())
                .leaveTypeName(request.getLeaveType().getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(request.getTotalDays())
                .reason(request.getReason())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .build()
        ).toList();
    }
}