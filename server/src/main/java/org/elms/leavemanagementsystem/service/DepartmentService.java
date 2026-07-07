package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.DepartmentRequest;
import org.elms.leavemanagementsystem.dto.response.DepartmentsResponse;
import org.elms.leavemanagementsystem.entity.Department;
import org.elms.leavemanagementsystem.entity.Employee;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.elms.leavemanagementsystem.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {
    private DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    public DepartmentService(DepartmentRepository departmentRepository,
                             EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    public List<DepartmentsResponse> getDepartments() {
        List<Department> departments = departmentRepository.findAll();

        return departments.stream()
                .map(department -> DepartmentsResponse.builder()
                        .departmentID(department.getDepartmentID())
                        .departmentName(department.getDepartmentName())
                        .active(department.getIsActive())
                        .build())
                .toList();
    }

    @Transactional
    public void createDepartment(DepartmentRequest request) {
        // Kiểm tra xem mã phòng ban đã tồn tại chưa
        if (departmentRepository.existsByDepartmentCode(request.getDepartmentCode())) {
            throw new BusinessException("Mã phòng ban đã tồn tại trong hệ thống!");
        }

        Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy nhân viên!"));


        Department department = new Department();
        department.setDepartmentCode(request.getDepartmentCode());
        department.setDepartmentName(request.getDepartmentName());
        department.setDescription(request.getDescription());
        department.setManager(manager); // ID của Trưởng phòng

        // Thiết lập trạng thái bảo mật ban đầu
        department.setApprovalStatus(Department.ApprovalStatus.PENDING);
        department.setIsActive(false); // Chưa được HLM duyệt thì chưa hoạt động

        departmentRepository.save(department);
    }

    @Transactional
    public void toggleDepartmentStatus(Integer id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng ban!"));

        // Ràng buộc bảo mật: Chỉ cho phép Tắt/Bật nếu phòng ban đó ĐÃ ĐƯỢC DUYỆT
        if (department.getApprovalStatus() != Department.ApprovalStatus.APPROVED) {
            throw new BusinessException("Không thể thay đổi trạng thái của phòng ban chưa được phê duyệt!");
        }

        // Đảo ngược trạng thái
        department.setIsActive(!department.getIsActive());

        departmentRepository.save(department);
    }

}
