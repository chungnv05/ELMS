package org.elms.leavemanagementsystem.dto.response;

import org.elms.leavemanagementsystem.entity.ApprovalHistory;

import java.time.LocalDate;
import java.util.List;

public class LeaveRequestDetailResponse {
    private Long id;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private List<String> proofFilePaths ;

}
