package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

// Trả về loại nghỉ phép
@Data
@Builder
public class LeaveTypeResponse {
    private Integer typeId;
    private String name;
}
