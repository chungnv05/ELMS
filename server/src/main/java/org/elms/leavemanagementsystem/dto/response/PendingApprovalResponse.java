package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PendingApprovalResponse {

    private List<DepartmentResponse> departments;
    private List<LeaveTypeResponse> leaveTypes;
}
