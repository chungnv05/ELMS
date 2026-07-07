package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ManagerResponse {
    private int id;
    private String fullName;
    private String employeeCode;
}
