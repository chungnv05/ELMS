package org.elms.leavemanagementsystem.dto.request;


import lombok.Data;
import org.elms.leavemanagementsystem.entity.ApprovalHistory;

@Data
public class LeaveApprovalRequest {
    private Integer requestId;
    private ApprovalHistory.Action action;
    private String comment;
}
