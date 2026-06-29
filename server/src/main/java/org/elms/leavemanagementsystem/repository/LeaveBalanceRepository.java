package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.LeaveBalance;
import org.elms.leavemanagementsystem.entity.LeaveBalanceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, LeaveBalanceId> {

    // Tìm số dư phép của nhân viên theo năm
    Optional<LeaveBalance> findByEmployee_EmpIDAndId_Year(Integer empId, Integer year);
}
