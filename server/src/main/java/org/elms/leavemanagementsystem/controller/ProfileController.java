package org.elms.leavemanagementsystem.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.elms.leavemanagementsystem.dto.request.ChangePasswordRequest;
import org.elms.leavemanagementsystem.dto.response.UserInfoResponse;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService employeeService;

    @GetMapping
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(employeeService.getProfile(userDetails.getEmployee().getEmpID()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        employeeService.changePassword(userDetails.getEmployee().getEmpID(), request);

        return ResponseEntity.ok(Collections.singletonMap("message", "Đổi mật khẩu thành công!"));
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        UserInfoResponse profile = UserInfoResponse.builder()
                .fullName(currentEmp.getFullName())
                .empCode(currentEmp.getEmpCode())
                .build();

        return ResponseEntity.ok(profile);

    }
}