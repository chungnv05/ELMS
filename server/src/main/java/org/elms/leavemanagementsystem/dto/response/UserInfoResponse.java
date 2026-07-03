package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

// Trả về tên và mã NV
@Data
@Builder
public class UserInfoResponse {
    private String fullName;
    private String empCode;
}
