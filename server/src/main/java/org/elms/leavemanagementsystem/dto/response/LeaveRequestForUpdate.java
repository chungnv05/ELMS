package org.elms.leavemanagementsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Trả về thông tin chi tiết của một đơn nghỉ phép để phục vụ cho việc cập nhật
@Data
@Builder
public class LeaveRequestForUpdate {
    private Integer requestId;
    private String requestCode;

    private Integer typeId;
    private String typeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LocalDateTime createdAt;

    private List<Integer> evidenceFileIds;

}
