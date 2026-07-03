package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.ChangePasswordRequest;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.dto.response.CompanyStatsResponse;
import org.elms.leavemanagementsystem.dto.response.EmployeeResponse;
import org.elms.leavemanagementsystem.dto.response.UserProfileDetailResponse;
import org.elms.leavemanagementsystem.entity.*;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.elms.leavemanagementsystem.repository.LeaveBalanceRepository;
import org.elms.leavemanagementsystem.repository.LeaveRequestRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder,
                           LeaveBalanceRepository leaveBalanceRepository,
                           LeaveRequestRepository leaveRequestRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    public Employee getEmployeeById(Integer empId) {
        return employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));
    }

    public void createEmployeeAccount(Integer empId, CreateAccountRequest createAccountRequest) {
        Employee hr = getEmployeeById(empId);

        if (hr.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }


        if (employeeRepository.existsByEmail(createAccountRequest.getEmail())) {
            throw new BusinessException("Email đã tồn tại!");
        }

        if (employeeRepository.existsByEmpCode(createAccountRequest.getEmpCode())) {
            throw new BusinessException("Mã nhân viên đã tồn tại!");
        }

        Department department = departmentRepository.findById(createAccountRequest.getDepartmentID())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ban hợp lệ!"));

        Employee employee = Employee.builder()
                .empCode(createAccountRequest.getEmpCode())
                .fullName(createAccountRequest.getFullName())
                .email(createAccountRequest.getEmail())
                .password(passwordEncoder.encode(createAccountRequest.getPassword()))
                .phoneNumber(createAccountRequest.getPhoneNumber())
                .address(createAccountRequest.getAddress())
                .role(Employee.Role.valueOf(createAccountRequest.getRole()))
                .isActive(true)
                .hiredDate(createAccountRequest.getHiredDate())
                .department(department)
                .build();

        // Save trước để thêm vào leave balance
        employeeRepository.save(employee);

        LeaveBalance leaveBalance = LeaveBalance.builder()
                .id(new LeaveBalanceId(
                        employee.getEmpID(),
                        LocalDate.now().getYear()
                ))
                .employee(employee)
                .totalDays(BigDecimal.valueOf(12))
                .usedDays(BigDecimal.ZERO)
                .pendingDays(BigDecimal.ZERO)
                .build();

        leaveBalanceRepository.save(leaveBalance);
    }

    public Integer getDepartmentOfEmployee(Integer empId) {

        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ (ID: " + empId + ")"));

        // 3. Xử lý an toàn trường hợp Nhân viên chưa có phòng ban
        if (employee.getDepartment() == null) {
            System.out.println("=> Nhân viên này chưa được gán phòng ban nào!");
            return null;
        }

        return employee.getDepartment().getDepartmentID();
    }

    public CompanyStatsResponse getCompanyStats(Integer hrEmpId) {

        Employee hr = getEmployeeById(hrEmpId);
        if (hr.getRole() != Employee.Role.HR_ADMIN) {
            throw new AccessDeniedException("Không đủ quyền thực hiện thao tác!");
        }

        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();


        int totalEmployees = (int) employeeRepository.countByIsActive(true);
        int totalDepartment = (int) departmentRepository.count();
        int pendingRequests = leaveRequestRepository.countByStatus(LeaveRequest.Status.PENDING);
        int onLeaveToday = leaveRequestRepository.countOnLeaveToday(today);
        int requestsThisMonth = leaveRequestRepository.countRequestsThisMonth(startOfMonth, endOfMonth);


        return CompanyStatsResponse.builder()
                .totalEmployees(totalEmployees)
                .totalDepartment(totalDepartment)
                .pendingRequests(pendingRequests)
                .onLeaveToday(onLeaveToday)
                .requestsThisMonth(requestsThisMonth)
                .build();
    }

    public UserProfileDetailResponse getMyProfile(Integer empId) {
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

    public List<EmployeeResponse> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll(Sort.by(Sort.Direction.DESC, "empID"));

        // Chuyển đổi từ Entity sang DTO
        return employees.stream().map(emp -> EmployeeResponse.builder()
                .empID(emp.getEmpID())
                .empCode(emp.getEmpCode())
                .fullName(emp.getFullName())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getDepartmentName() : "")
                .role(emp.getRole().name())
                .isActive(emp.getIsActive())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void toggleEmployeeStatus(Integer empId) {
        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy thông tin nhân viên với ID: " + empId));

        employee.setIsActive(!employee.getIsActive());

        employeeRepository.save(employee);
    }
}
