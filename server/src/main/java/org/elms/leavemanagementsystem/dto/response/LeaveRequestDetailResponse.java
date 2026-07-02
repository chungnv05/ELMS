package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Trả về chi tiết đơn nghỉ phép, bao gồm thông tin người tạo, thông tin đơn, danh sách file đính kèm và lịch sử phê duyệt
@Data
@Builder
public class LeaveRequestDetailResponse {

    private Integer requestId;
    private String requestCode;

    // Thông tin người tạo
    private String employeeName;
    private String employeeCode;

    // Thông tin đơn
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private String status;
    private String rejectionReason;
    private LocalDateTime createdAt;

    private boolean isOwner;

    private List<String> evidenceFiles;

    private List<ApprovalHistoryResponse> approvalHistories;

    @Data
    @Builder
    public static class ApprovalHistoryResponse {
        private String approverName;
        private String action;
        private String comment;
        private LocalDateTime createdAt;
    }
}