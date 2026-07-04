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

    @Transactional
    public void importEmployeeFromExcel(MultipartFile employeeFile) {
        if (employeeFile.isEmpty() || employeeFile.getSize() == 0) {
            throw new BusinessException("Không tìm thấy file excel!");
        }

        List<Employee> newEmployees = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(employeeFile.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                newEmployees.add(parseEmployee(row, i + 1));
            }

            employeeRepository.saveAll(newEmployees);

        } catch (Exception e) {
            throw new SystemException("Lỗi khi đọc file excel!");
        }
    }

    private Employee parseEmployee(Row row, int rowNumber) {

        String empCode = getCellValueAsString(row.getCell(0));
        String fullName = getCellValueAsString(row.getCell(1));
        String email = getCellValueAsString(row.getCell(2));
        String password = getCellValueAsString(row.getCell(3));
        String deptId = getCellValueAsString(row.getCell(4));
        String role = getCellValueAsString(row.getCell(5));
        String phone = getCellValueAsString(row.getCell(6));
        String hiredDate = getCellValueAsString(row.getCell(7));
        String address = getCellValueAsString(row.getCell(8));

        validateRequiredFields(
                empCode,
                fullName,
                email,
                password,
                rowNumber
        );

        validateDuplicate(empCode, email, rowNumber);

        Employee employee = new Employee();

        employee.setEmpCode(empCode);
        employee.setFullName(fullName);
        employee.setEmail(email);
        employee.setPassword(passwordEncoder.encode(password));
        employee.setPhoneNumber(phone);
        employee.setAddress(address);
        employee.setIsActive(true);

        employee.setRole(parseRole(role, rowNumber));
        employee.setDepartment(parseDepartment(deptId, rowNumber));
        employee.setHiredDate(parseHiredDate(hiredDate, rowNumber));

        return employee;
    }

    private void validateRequiredFields(
            String empCode,
            String fullName,
            String email,
            String password,
            int rowNumber
    ) {

        if (empCode.isBlank()) {
            throw new BusinessException("Mã nhân viên không được để trống!");
        }

        if (fullName.isBlank()) {
            throw new BusinessException("Họ tên không được để trống!");
        }

        if (email.isBlank()) {
            throw new BusinessException("Email không được để trống!");
        }

        if (password.isBlank()) {
            throw new BusinessException("Mật khẩu không được để trống!");
        }
    }

    private void validateDuplicate(
            String empCode,
            String email,
            int rowNumber
    ) {

        if (employeeRepository.existsByEmpCode(empCode)) {
            throw new BusinessException("Mã nhân viên đã tồn tại!");
        }

        if (employeeRepository.existsByEmail(email)) {
            throw new BusinessException("Email đã tồn tại!");
        }
    }

    private Employee.Role parseRole(String role, int rowNumber) {

        if (role.isBlank()) {
            return Employee.Role.EMPLOYEE;
        }

        try {
            return Employee.Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException(
                    "Vị trí không hợp lệ!"
            );
        }
    }

    private Department parseDepartment(String deptId, int rowNumber) {

        if (deptId.isBlank()) {
            return null;
        }

        try {
            Integer departmentID = Integer.parseInt(deptId.trim());
            return departmentRepository.findById(departmentID)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy phòng ban hợp lệ!"
                    ));
        } catch (NumberFormatException ex) {
            throw new BusinessException(
                    "Phòng ban không hợp lệ!"
            );
        }
    }

    private LocalDate parseHiredDate(
            String hiredDate,
            int rowNumber
    ) {

        if (hiredDate.isBlank()) {
            return LocalDate.now();
        }

        try {
            return LocalDate.parse(hiredDate);
        } catch (DateTimeParseException ex) {
            throw new BusinessException(
                    "Định dạng ngày không hợp lệ!"
            );
        }
    }

    private String getCellValueAsString(Cell cell) {

        if (cell == null) {
            return "";
        }

        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }
}
