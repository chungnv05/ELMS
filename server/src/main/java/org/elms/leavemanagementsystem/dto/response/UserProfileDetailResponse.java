package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserProfileDetailResponse {
    private String empCode;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
    private String departmentName;
    private LocalDate hiredDate;
}
