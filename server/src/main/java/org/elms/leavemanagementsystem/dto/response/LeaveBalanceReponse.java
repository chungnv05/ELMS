package org.elms.leavemanagementsystem.dto.response;

import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

// Trả quỹ nghỉ phép
@Data
@Builder
public class LeaveBalanceReponse {
    private Integer year;
    private BigDecimal totalDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;

}
