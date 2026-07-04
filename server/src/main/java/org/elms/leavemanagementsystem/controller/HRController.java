package org.elms.leavemanagementsystem.controller;


import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.dto.response.CompanyStatsResponse;
import org.elms.leavemanagementsystem.dto.response.DepartmentsResponse;
import org.elms.leavemanagementsystem.dto.response.EmployeeResponse;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.DepartmentService;
import org.elms.leavemanagementsystem.service.EmployeeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/hr")
public class HRController {
    private final EmployeeService employeeService;
    private final DepartmentService departmentService;

    public HRController(EmployeeService employeeService,
                        DepartmentService departmentService) {
        this.employeeService = employeeService;
        this.departmentService = departmentService;
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

    @GetMapping("/stats")
    public ResponseEntity<?> getCompanyStats(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        CompanyStatsResponse statsResponse = employeeService.getCompanyStats(currentEmp.getEmpID());

        return ResponseEntity.status(HttpStatus.OK)
                .body(statsResponse);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }
        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền truy cập!");
        }

        List<EmployeeResponse> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @PutMapping("/employees/{empId}/toggle-status")
    public ResponseEntity<?> toggleEmployeeStatus(@PathVariable Integer empId, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }
        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền truy cập!");
        }

        employeeService.toggleEmployeeStatus(empId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật trạng thái tài khoản thành công!"));
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentsResponse>> getDepartments(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }
        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền truy cập!");
        }

        List<DepartmentsResponse> departmentsResponseList = departmentService.getDepartments();
        return ResponseEntity.ok(departmentsResponseList);

    }

    @PostMapping("/employees/import")
    public ResponseEntity<?> importEmployees(@RequestParam("file") MultipartFile file, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền truy cập!");
        }
        if (!file.getOriginalFilename().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Vui lòng upload file Excel định dạng .xlsx"));
        }

        employeeService.importEmployeeFromExcel(file);
        return ResponseEntity.ok(Collections.singletonMap("message", "Import dữ liệu nhân viên thành công!"));
    }
}
