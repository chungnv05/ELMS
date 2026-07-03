package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployeeResponse {
    private Integer empID;
    private String empCode;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String departmentName;
    private String role;
    private Boolean isActive;
}