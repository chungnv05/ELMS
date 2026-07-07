package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

// Trả về loại nghỉ phép
@Data
@Builder
public class LeaveTypeResponse {
    private Integer typeId;
    private String name;
    private Boolean isPaid;
    private Boolean requiresEvidence;
    private Integer defaultDays;
    private Boolean isActive;
    private String status;

}
