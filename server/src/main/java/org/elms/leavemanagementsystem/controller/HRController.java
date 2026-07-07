package org.elms.leavemanagementsystem.controller;


import jakarta.validation.Valid;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.dto.request.DepartmentRequest;
import org.elms.leavemanagementsystem.dto.request.LeaveTypeRequest;
import org.elms.leavemanagementsystem.dto.response.*;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.security.CustomUserDetails;
import org.elms.leavemanagementsystem.service.DepartmentService;
import org.elms.leavemanagementsystem.service.HRService;
import org.elms.leavemanagementsystem.service.LeaveTypeService;
import org.elms.leavemanagementsystem.service.UserService;
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
    private final HRService hrService;
    private final DepartmentService departmentService;
    private final LeaveTypeService leaveTypeService;

    public HRController(HRService hrService,
                        DepartmentService departmentService,
                        LeaveTypeService leaveTypeService) {
        this.hrService = hrService;
        this.departmentService = departmentService;
        this.leaveTypeService = leaveTypeService;
    }

    // Tạo tài khoản cho nhân viên mới
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

        hrService.createEmployeeAccount(hrId, createAccountRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "Tạo tài khoản nhân viên thành công!"));

    }

    // API lấy thông số liệu thống kê của công ty
    @GetMapping("/stats")
    public ResponseEntity<?> getCompanyStats(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        CompanyStatsResponse statsResponse = hrService.getCompanyStats(currentEmp.getEmpID());

        return ResponseEntity.status(HttpStatus.OK)
                .body(statsResponse);
    }

    // API lấy các nhân viên trong công ty
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

        List<EmployeeResponse> employees = hrService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    // API cập nhật trạng thái tài khoản nhân viên
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

        hrService.toggleEmployeeStatus(empId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật trạng thái tài khoản thành công!"));
    }

    // API lấy danh sách phòng ban
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

    // API tạo tài khoản nhân viên thông qua import excel
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

        hrService.importEmployeeFromExcel(file);
        return ResponseEntity.ok(Collections.singletonMap("message", "Import dữ liệu nhân viên thành công!"));
    }

    // API tạo loại nghỉ phép mới
    @PostMapping("/leave-types/create")
    public ResponseEntity<?> create(@Valid @RequestBody LeaveTypeRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        leaveTypeService.createLeaveType(request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Thêm cấu hình loại phép thành công!"));
    }

    // API tắt loại nghỉ phép
    @PutMapping("/leave-types/{id}/toggle")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();
        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }
        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }
        leaveTypeService.toggleStatus(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật trạng thái thành công!"));
    }

    // API lấy loại nghỉ phép
    @GetMapping("/leave-types")
    public ResponseEntity<?> getAllLeaveTypes(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }
        List<LeaveTypeResponse> leaveTypes = leaveTypeService.getAllLeaveTypes();
        return ResponseEntity.ok(leaveTypes);
    }

    // API tạo phòng ban mới
    @PostMapping("/department/create")
    public ResponseEntity<?> createDepartment(
            @Valid @RequestBody DepartmentRequest request,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        departmentService.createDepartment(request);
        return ResponseEntity.ok(Collections.singletonMap("message", "Đã gửi yêu cầu tạo phòng ban, vui lòng chờ cấp trên phê duyệt!"));
    }

    @PutMapping("/department/{id}/toggle")
    public ResponseEntity<?> toggleDepartmentStatus(
            @PathVariable Integer id,
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        departmentService.toggleDepartmentStatus(id);
        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật trạng thái phòng ban thành công!"));
    }

    @GetMapping("/managers")
    public ResponseEntity<?> getAllManagers(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Employee currentEmp = userDetails.getEmployee();

        if (currentEmp == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!");
        }

        if (currentEmp.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        List<ManagerResponse> managerList = hrService.getAllManagers();
        return ResponseEntity.ok(managerList);
    }
}
