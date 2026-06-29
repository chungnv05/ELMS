package org.elms.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Data
public class LeaveRequestForm {
    @NotNull(message = "Vui lòng chọn loại nghỉ phép")
    private Integer typeId;

    @NotNull(message = "Vui lòng chọn ngày bắt đầu")
    @FutureOrPresent(message = "Ngày bắt đầu không hợp lệ")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "Vui lòng chọn ngày kết thúc")
    @FutureOrPresent(message = "Ngày kết thúc không hợp lệ")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotBlank(message = "Lý do không được để trống")
    private String reason;

    private List<MultipartFile> evidenceFiles;
}
