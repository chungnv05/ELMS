package org.elms.leavemanagementsystem.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.elms.leavemanagementsystem.dto.request.CreateAccountRequest;
import org.elms.leavemanagementsystem.dto.response.CompanyStatsResponse;
import org.elms.leavemanagementsystem.dto.response.EmployeeResponse;
import org.elms.leavemanagementsystem.dto.response.ManagerResponse;
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

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class HRService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public HRService(EmployeeRepository employeeRepository,
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

    public List<ManagerResponse> getAllManagers() {
        List<Employee> managers = employeeRepository.findByRole(Employee.Role.MANAGER);

        return managers.stream().map(manager -> ManagerResponse.builder()
                .id(manager.getEmpID())
                .fullName(manager.getFullName())
                .employeeCode(manager.getEmpCode())
                .build()
        ).collect(Collectors.toList());
    }

    public void createEmployeeAccount(Integer empId, CreateAccountRequest createAccountRequest) {
        Employee hr =  employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));

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

    public CompanyStatsResponse getCompanyStats(Integer hrEmpId) {

        Employee hr = employeeRepository.findById(hrEmpId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));

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

        try (Workbook workbook = new XSSFWorkbook(employeeFile.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();


            Set<String> excelEmpCodes = new HashSet<>();
            Set<String> excelEmails = new HashSet<>();

            for (int i = 1; i <= lastRowNum; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String empCode = getCellValueAsString(row.getCell(0));
                String email = getCellValueAsString(row.getCell(2));

                if (!empCode.isBlank()) excelEmpCodes.add(empCode);
                if (!email.isBlank()) excelEmails.add(email);
            }

            // Phát hiện trung lặp trong db
            Set<String> ExistingEmpCodes = excelEmpCodes.isEmpty() ? new HashSet<>()
                    : employeeRepository.findExistingEmpCodes(excelEmpCodes);

            Set<String> ExistingEmails = excelEmails.isEmpty() ? new HashSet<>()
                    : employeeRepository.findExistingEmails(excelEmails);

            // Phát hiện trùng lặp ngay trong file Excel
            Set<String> processedEmpCodes = new HashSet<>();
            Set<String> processedEmails = new HashSet<>();

            // Cache bộ nhớ tạm để tránh N+1 Query khi tìm Department liên tục
            Map<Integer, Department> departmentCache = new HashMap<>();

            List<Employee> newEmployees = new ArrayList<>();


            for (int i = 1; i <= lastRowNum; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String empCode = getCellValueAsString(row.getCell(0));
                String email = getCellValueAsString(row.getCell(2));
                int rowNum = i + 1;


                if (ExistingEmpCodes.contains(empCode)) {
                    throw new BusinessException("Mã nhân viên hàng " + rowNum + " đã tồn tại trong hệ thống!");
                }
                if (ExistingEmails.contains(email)) {
                    throw new BusinessException("Email hàng " + rowNum + " đã tồn tại trong hệ thống!");
                }

                // Validate trùng lặp nội bộ trong cùng file Excel
                if (!processedEmpCodes.add(empCode)) {
                    throw new BusinessException("Mã nhân viên hàng " + rowNum + " bị trùng lặp bên trong file Excel!");
                }
                if (!processedEmails.add(email)) {
                    throw new BusinessException("Email hàng " + rowNum + " bị trùng lặp bên trong file Excel!");
                }


                newEmployees.add(parseEmployee(row, rowNum, empCode, email, departmentCache));
            }


            employeeRepository.saveAll(newEmployees);

        } catch (BusinessException | ResourceNotFoundException e) {
            throw e;
        } catch (IOException e) {
            throw new SystemException("Lỗi khi đọc file excel!");
        } catch (Exception e) {
            throw new SystemException("Đã xảy ra lỗi hệ thống khi xử lý dữ liệu!");
        }
    }

    private Employee parseEmployee(Row row, int rowNumber, String empCode, String email, Map<Integer, Department> departmentCache) {
        String fullName = getCellValueAsString(row.getCell(1));
        String password = getCellValueAsString(row.getCell(3));
        String deptId = getCellValueAsString(row.getCell(4));
        String role = getCellValueAsString(row.getCell(5));
        String phone = getCellValueAsString(row.getCell(6));
        String hiredDate = getCellValueAsString(row.getCell(7));
        String address = getCellValueAsString(row.getCell(8));

        // Kiểm tra các trường dữ liệu bắt buộc phải nhập
        validateRequiredFields(empCode, fullName, email, password, rowNumber);

        Employee employee = new Employee();
        employee.setEmpCode(empCode);
        employee.setFullName(fullName);
        employee.setEmail(email);
        employee.setPassword(passwordEncoder.encode(password));
        employee.setPhoneNumber(phone);
        employee.setAddress(address);
        employee.setIsActive(true);

        employee.setRole(parseRole(role, rowNumber));
        employee.setDepartment(parseDepartment(deptId, rowNumber, departmentCache));
        employee.setHiredDate(parseHiredDate(hiredDate, rowNumber));

        return employee;
    }

    private void validateRequiredFields(String empCode, String fullName, String email, String password, int rowNumber) {
        if (empCode.isBlank()) throw new BusinessException("Mã nhân viên hàng " + rowNumber + " không được để trống!");
        if (fullName.isBlank()) throw new BusinessException("Tên đầy đủ hàng " + rowNumber + " không được để trống!");
        if (email.isBlank()) throw new BusinessException("Email hàng " + rowNumber + " không được để trống!");
        if (password.isBlank()) throw new BusinessException("Mật khẩu hàng " + rowNumber + " không được để trống!");
    }

    private Employee.Role parseRole(String role, int rowNumber) {
        if (role.isBlank()) {
            return Employee.Role.EMPLOYEE;
        }
        try {
            return Employee.Role.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Nhân viên ở hàng " + rowNumber + " có vị trí không hợp lệ!");
        }
    }

    private Department parseDepartment(String deptId, int rowNumber, Map<Integer, Department> departmentCache) {
        if (deptId.isBlank()) {
            return null;
        }
        try {
            Integer departmentID = Integer.parseInt(deptId.trim());

            // Caching tránh việc phải truy vấn vào db
            if (departmentCache.containsKey(departmentID)) {
                return departmentCache.get(departmentID);
            }

            Department dept = departmentRepository.findByDepartmentIDAndIsActive(departmentID, true)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy phòng ban hợp lệ cho nhân viên ở hàng " + rowNumber
                    ));

            departmentCache.put(departmentID, dept);
            return dept;
        } catch (NumberFormatException ex) {
            throw new BusinessException("Mã phòng ban ở hàng " + rowNumber + " không hợp lệ!");
        }
    }

    private LocalDate parseHiredDate(String hiredDate, int rowNumber) {
        if (hiredDate.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(hiredDate); // Định dạng chuẩn ISO: yyyy-MM-dd
        } catch (DateTimeParseException ex) {
            throw new BusinessException("Định dạng ngày ở hàng " + rowNumber + " không hợp lệ! (Yêu cầu: yyyy-MM-dd)");
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
