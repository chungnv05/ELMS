package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.Employee;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // Tìm nhân viên theo email
    Optional<Employee> findByEmail(String email);

    // Kiểm tra email hoặc mã nhân viên đã tồn tại chưa khi thêm mới
    boolean existsByEmail(String email);
    boolean existsByEmpCode(String empCode);

    long countByIsActive(Boolean isActive);

    // Tìm danh sách nhân viên theo phòng ban
    List<Employee> findByDepartment_DepartmentID(Integer departmentId);


}
