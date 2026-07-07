package org.elms.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveEventResponse {
    private Integer requestId;
    private String fullName; // Tên người nghỉ
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveTypeName;
    private String status;
}
