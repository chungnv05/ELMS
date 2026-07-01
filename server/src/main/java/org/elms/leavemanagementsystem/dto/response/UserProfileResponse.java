package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private String fullName;
    private String empCode;
}
