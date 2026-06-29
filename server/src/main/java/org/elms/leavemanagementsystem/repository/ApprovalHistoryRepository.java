package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Integer> {
    // Lấy lịch sử duyệt của một đơn cụ thể
    List<ApprovalHistory> findByLeaveRequest_RequestIDOrderByCreatedAtDesc(Integer requestId);
}