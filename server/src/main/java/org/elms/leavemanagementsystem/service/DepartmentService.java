package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.response.DepartmentsResponse;
import org.elms.leavemanagementsystem.entity.Department;
import org.elms.leavemanagementsystem.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private DepartmentRepository departmentRepository;
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<DepartmentsResponse> getDepartments() {
        List<Department> departments = departmentRepository.findAll();

        return departments.stream()
                .map(department -> DepartmentsResponse.builder()
                        .departmentID(department.getDepartmentID())
                        .departmentName(department.getDepartmentName())
                        .build())
                .toList();
    }
}
