package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, Integer> {
    List<LeaveType> findByIsActiveTrue();
}
