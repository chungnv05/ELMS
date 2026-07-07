package org.elms.leavemanagementsystem.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.elms.leavemanagementsystem.dto.request.ChangePasswordRequest;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.dto.response.CompanyStatsResponse;
import org.elms.leavemanagementsystem.dto.response.EmployeeResponse;
import org.elms.leavemanagementsystem.dto.response.UserProfileDetailResponse;
import org.elms.leavemanagementsystem.entity.*;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.exception.SystemException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.elms.leavemanagementsystem.repository.LeaveBalanceRepository;
import org.elms.leavemanagementsystem.repository.LeaveRequestRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(EmployeeRepository employeeRepository,
                       PasswordEncoder passwordEncoder) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Employee getEmployeeById(Integer empId) {
        return employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));
    }

    public Integer getDepartmentOfEmployee(Integer empId) {

        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ (ID: " + empId + ")"));

        if (employee.getDepartment() == null) {
            return null;
        }

        return employee.getDepartment().getDepartmentID();
    }

    public UserProfileDetailResponse getProfile(Integer empId) {
        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin tài khoản!"));

        return UserProfileDetailResponse.builder()
                .empCode(emp.getEmpCode())
                .fullName(emp.getFullName())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .address(emp.getAddress())
                .role(emp.getRole().name())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "Chưa cập nhật")
                .hiredDate(emp.getHiredDate())
                .build();
    }

    @Transactional
    public void changePassword(Integer empId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Mật khẩu xác nhận không khớp!");
        }

        Employee emp = employeeRepository.findById(empId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy tài khoản!"));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(request.getCurrentPassword(), emp.getPassword())) {
            throw new BusinessException("Mật khẩu hiện tại không chính xác!");
        }

        // Mã hóa và lưu mật khẩu mới
        emp.setPassword(passwordEncoder.encode(request.getNewPassword()));
        employeeRepository.save(emp);
    }

}
