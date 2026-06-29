package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    // Lấy tất cả đơn của một nhân viên cụ thể
    List<LeaveRequest> findByEmployee_EmpID(Integer empId);

    // Lọc đơn theo trạng thái (ví dụ: lấy các đơn PENDING để duyệt)
    List<LeaveRequest> findByStatus(String status);

    // [QUAN TRỌNG] Custom Query kiểm tra trùng lịch nghỉ
    // Tìm các đơn của nhân viên X (không bị Hủy/Từ chối) mà thời gian giao nhau với khoảng thời gian xin nghỉ mới
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.empID = :empId " +
            "AND lr.status NOT IN ('REJECTED', 'CANCELLED') " +
            "AND (lr.startDate <= :endDate AND lr.endDate >= :startDate)")
    List<LeaveRequest> findOverlappingRequests(
            @Param("empId") Integer empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}