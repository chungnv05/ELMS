package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CompanyStatsResponse {
    private int totalEmployees;
    private int totalDepartment;
    private int pendingRequests;
    private int onLeaveToday;
    private int requestsThisMonth;

}
