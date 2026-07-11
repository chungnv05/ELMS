package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HLMStatsResponse {
    private long totalEmployees;
    private long activeDepartments;
    private long pendingRequests;
}