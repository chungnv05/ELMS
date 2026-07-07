package org.elms.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class LeaveTypeRequest {
    @NotBlank(message = "Tên loại nghỉ phép không được để trống")
    private String name;

    @NotNull(message = "Vui lòng xác định có hưởng lương hay không")
    private Boolean isPaid;

    @NotNull(message = "Vui lòng xác định có cần minh chứng không")
    private Boolean requiresEvidence;

    @NotNull(message = "Số ngày mặc định không được để trống")
    @Min(value = 0, message = "Số ngày mặc định phải lớn hơn hoặc bằng 0")
    private Integer defaultDays;
}