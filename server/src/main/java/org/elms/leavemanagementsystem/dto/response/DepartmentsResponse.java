package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentsResponse {
    private Integer departmentID;
    private String departmentCode;
    private String managerName;
    private String departmentName;
    private String approvalStatus;
    private boolean active;
}
