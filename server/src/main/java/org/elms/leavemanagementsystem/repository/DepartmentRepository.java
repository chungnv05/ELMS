package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    boolean existsByDepartmentCode(String departmentCode);
    Optional<Department> findByDepartmentIDAndIsActive(Integer departmentID, Boolean isActive);
    Optional<Department> findByManager_EmpID(Integer empID);

    // Lấy danh sách manager đã quản lý phòng ban
    @Query("SELECT d.manager.empID FROM Department d WHERE d.manager IS NOT NULL")
    List<Integer> findAllManagerIds();

    long countByIsActiveTrue();

    // Đếm phòng ban chờ duyệt
    long countByApprovalStatus(Department.ApprovalStatus approvalStatus);

    // Lấy danh sách phòng ban theo trạng thái duyệt
    List<Department> findByApprovalStatus(Department.ApprovalStatus approvalStatus);

}
