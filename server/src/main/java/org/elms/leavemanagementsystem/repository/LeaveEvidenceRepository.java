package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.LeaveEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveEvidenceRepository extends JpaRepository<LeaveEvidence, Integer> {
    List<LeaveEvidence> findByLeaveRequest_RequestID(Integer requestId);


}