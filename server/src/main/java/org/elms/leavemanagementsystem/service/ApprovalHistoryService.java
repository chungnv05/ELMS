package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.entity.ApprovalHistory;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.repository.ApprovalHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ApprovalHistoryService {

    private final ApprovalHistoryRepository approvalHistoryRepository;

    public ApprovalHistoryService(ApprovalHistoryRepository approvalHistoryRepository) {
        this.approvalHistoryRepository = approvalHistoryRepository;
    }

    @Transactional
    public void logAction(LeaveRequest request, Employee actor,
                          ApprovalHistory.Action action,
                          LeaveRequest.Status statusBefore,
                          LeaveRequest.Status statusAfter,
                          String comment) {

        ApprovalHistory history = new ApprovalHistory();
        history.setLeaveRequest(request);
        history.setActor(actor);
        history.setAction(action);
        history.setStatusBefore(ApprovalHistory.Status.valueOf(statusBefore.name()));
        history.setStatusAfter(ApprovalHistory.Status.valueOf(statusAfter.name()));
        history.setComment(comment);

        approvalHistoryRepository.save(history);
    }

    @Transactional
    public void createFirstHistory(
            LeaveRequest request,
            Employee actor,
            ApprovalHistory.Action action,
            LeaveRequest.Status statusAfter,
            String comment) {

        ApprovalHistory history = new ApprovalHistory();
        history.setLeaveRequest(request);
        history.setActor(actor);
        history.setAction(action);

        history.setStatusBefore(null);

        // Trạng thái sau khi submit
        history.setStatusAfter(
                ApprovalHistory.Status.valueOf(statusAfter.name()));

        history.setComment(comment);

        approvalHistoryRepository.save(history);
    }
}