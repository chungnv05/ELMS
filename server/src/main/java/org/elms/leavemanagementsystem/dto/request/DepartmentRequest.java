package org.elms.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentRequest {

    @NotBlank(message = "Mã phòng ban không được để trống!")
    @Size(max = 20, message = "Mã phòng ban không được vượt quá 20 ký tự!")
    private String departmentCode;

    @NotBlank(message = "Tên phòng ban không được để trống!")
    @Size(max = 100, message = "Tên phòng ban không được vượt quá 100 ký tự!")
    private String departmentName;

    @Size(max = 255, message = "Mô tả không được vượt quá 255 ký tự!")
    private String description;

    // ID của Trưởng phòng (Có thể để null nếu lúc mới tạo phòng ban chưa bổ nhiệm ngay)
    private Integer managerId;
}