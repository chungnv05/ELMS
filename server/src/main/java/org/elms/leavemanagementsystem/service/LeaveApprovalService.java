package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveApprovalRequest;
import org.elms.leavemanagementsystem.entity.ApprovalHistory;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ConflictException;
import org.elms.leavemanagementsystem.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LeaveApprovalService {
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    private final LeaveRequestService leaveRequestService;
    private final EmployeeService employeeService;
    private final LeaveBalanceService leaveBalanceService;
    private final ApprovalHistoryService approvalHistoryService;

    public LeaveApprovalService(LeaveRequestService leaveRequestService, EmployeeService employeeService, LeaveBalanceService leaveBalanceService, ApprovalHistoryService approvalHistoryService) {
        this.leaveRequestService = leaveRequestService;
        this.employeeService = employeeService;
        this.leaveBalanceService = leaveBalanceService;
        this.approvalHistoryService = approvalHistoryService;
    }

    @Transactional
    public void processLeaveApproval(Integer approverId, LeaveApprovalRequest approvalRequest) {

        Employee approver = employeeService.getEmployeeById(approverId);
        LeaveRequest leaveRequest = leaveRequestService.getLeaveRequestById(approvalRequest.getRequestId());

        if (leaveRequest.getStatus() != LeaveRequest.Status.PENDING) {
            throw new ConflictException("Đơn nghỉ phép đã được xử lý trước đó");
        }

        LeaveRequest.Status statusBefore = leaveRequest.getStatus();
        LeaveRequest.Status statusAfter;
        Integer requestYear =  leaveRequest.getStartDate().getYear();

        // Phân luồng xử lý: APPROVED hoặc REJECTED
        if (approvalRequest.getAction() == ApprovalHistory.Action.APPROVED) {
            statusAfter = LeaveRequest.Status.APPROVED;

            leaveRequest.setStatus(statusAfter);
            leaveRequest.setApprovedAt(LocalDateTime.now());

            // Trừ vào ngày nghỉ trong năm
            leaveBalanceService.commitUsedDays(leaveRequest.getEmployee().getEmpID(), requestYear, leaveRequest.getTotalDays());

        } else if (approvalRequest.getAction() == ApprovalHistory.Action.REJECTED) {
            if (approvalRequest.getComment() == null || approvalRequest.getComment().trim().isEmpty()) {
                throw new BusinessException("Bắt buộc phải nhập lý do khi từ chối đơn nghỉ phép!");
            }

            statusAfter = LeaveRequest.Status.REJECTED;
            leaveRequest.setStatus(statusAfter);
            leaveRequest.setRejectionReason(approvalRequest.getComment());

            // Gọi Service quỹ phép để hoàn trả ngày nghỉ (Chỉ trừ đi ở Pending)
            leaveBalanceService.refundPendingDays(leaveRequest.getEmployee().getEmpID(), requestYear, leaveRequest.getTotalDays());

        } else {
            throw new BusinessException("Thao tác không hợp lệ!");
        }

        // 4. Lưu lại sự thay đổi của đơn nghỉ phép
        leaveRequestRepository.save(leaveRequest);

        // 5. Ghi log lịch sử thao tác
        approvalHistoryService.logAction(
                leaveRequest,
                approver,
                approvalRequest.getAction(),
                statusBefore,
                statusAfter,
                approvalRequest.getComment()
        );

        // Bổ sung chức năng thông báo email ở sau





    }
}
