package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee getEmployeeById(Integer empId) {
        return employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ"));
    }

    public void createEmployeeAccount() {

    }

    public Integer getDepartmentOfEmployee(Integer empId) {
        // 1. In ra Log để xem ID truyền vào có bị null hay sai số không
        System.out.println("=> Đang tìm phòng ban cho nhân viên có ID: " + empId);

        // 2. Nếu lỡ ID truyền vào bị null (do lỗi Token) thì chặn luôn
        if (empId == null) {
            throw new ResourceNotFoundException("Lỗi hệ thống: ID người dùng từ Token bị NULL!");
        }

        Employee employee = employeeRepository.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên hợp lệ (ID: " + empId + ")"));

        // 3. Xử lý an toàn trường hợp Nhân viên chưa có phòng ban
        if (employee.getDepartment() == null) {
            System.out.println("=> Nhân viên này chưa được gán phòng ban nào!");
            return null; // Trả về null thay vì để sập hệ thống
        }

        return employee.getDepartment().getDepartmentID();
    }
}
