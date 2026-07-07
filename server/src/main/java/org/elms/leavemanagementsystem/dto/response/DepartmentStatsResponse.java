package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentStatsResponse {
    private long pendingRequests;
    private long employeesOnLeaveToday;
    private long totalEmployees;
}
