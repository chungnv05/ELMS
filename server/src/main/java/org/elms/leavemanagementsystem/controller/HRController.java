package org.elms.leavemanagementsystem.controller;


import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

@RestController
@RequestMapping("/api/hr")
public class HRController {
    private final EmployeeService employeeService;

    public HRController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createEmployeeAccount(
            @Valid @RequestBody CreateAccountRequest createAccountRequest,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        Integer hrId = currentEmp.getEmpID();

        employeeService.createEmployeeAccount(hrId, createAccountRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "Tạo tài khoản nhân viên thành công!"));

    }
}
