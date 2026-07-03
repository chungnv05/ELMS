package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.entity.Department;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.entity.LeaveBalance;
import org.elms.leavemanagementsystem.entity.LeaveBalanceId;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.elms.leavemanagementsystem.repository.LeaveBalanceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder,
                           LeaveBalanceRepository leaveBalanceRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.leaveBalanceRepository = leaveBalanceRepository;

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
}
