package org.elms.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveEventResponse {
    private Integer requestId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String leaveTypeName;
    private String status;
}
