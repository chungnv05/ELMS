package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.Employee;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // Tìm nhân viên theo email
    Optional<Employee> findByEmail(String email);

    // Tim nhan vien theo role
    List<Employee> findByRole(Employee.Role role);

    // Kiểm tra email hoặc mã nhân viên đã tồn tại chưa khi thêm mới
    boolean existsByEmail(String email);
    boolean existsByEmpCode(String empCode);

    long countByIsActive(Boolean isActive);

    // Tìm danh sách nhân viên theo phòng ban
    List<Employee> findByDepartment_DepartmentID(Integer departmentId);
    // Đếm số nhân viên đang hoạt động trong một phòng ban cụ thể
    long countByDepartment_DepartmentIDAndIsActiveTrue(Integer departmentID);

    // Tìm các empCode đã tồn tại trong Database từ danh sách truyền vào
    @Query("SELECT e.empCode FROM Employee e WHERE e.empCode IN :empCodes")
    Set<String> findExistingEmpCodes(@Param("empCodes") Set<String> empCodes);

    // Tìm các email đã tồn tại trong Database từ danh sách truyền vào
    @Query("SELECT e.email FROM Employee e WHERE e.email IN :emails")
    Set<String> findExistingEmails(@Param("emails") Set<String> emails);

    // Tìm các nhân viên khác role cho sẵn
    Page<Employee> findByRoleNot(Employee.Role role, Pageable pageable);


}
