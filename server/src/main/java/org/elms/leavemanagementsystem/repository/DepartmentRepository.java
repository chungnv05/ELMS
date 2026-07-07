package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
    boolean existsByDepartmentCode(String departmentCode);
    Optional<Department> findByDepartmentIDAndIsActive(Integer departmentID, Boolean isActive);
    Optional<Department> findByManager_EmpID(Integer empID);

}
