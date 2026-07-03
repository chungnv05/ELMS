package org.elms.leavemanagementsystem.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class CreateAccountRequest {

    @NotBlank(message = "Mã nhân viên không được để trống")
    @Size(max = 20, message = "Mã nhân viên không được quá 20 ký tự")
    private String empCode;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được quá 100 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    @Size(max = 20, message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    private String address;

    @NotBlank(message = "Vui lòng chọn vai trò (Role)")
    @Pattern(regexp = "EMPLOYEE|MANAGER|HR_ADMIN", message = "Vai trò không hợp lệ")
    private String role;

    @NotNull(message = "Vui lòng chọn ngày vào làm")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate hiredDate;

    @NotNull(message = "Vui lòng chọn phòng ban")
    private Integer departmentID;
}