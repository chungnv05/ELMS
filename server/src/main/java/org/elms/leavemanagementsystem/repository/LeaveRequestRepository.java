package org.elms.leavemanagementsystem.repository;

import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {

    // Lấy tất cả đơn của một nhân viên cụ thể
    List<LeaveRequest> findByEmployee_EmpID(Integer empId);

    // Lọc đơn theo trạng thái (ví dụ: lấy các đơn PENDING để duyệt)
    List<LeaveRequest> findByStatus(String status);

    // Query kiểm tra trùng lịch nghỉ
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.empID = :empId " +
            "AND lr.status NOT IN ('REJECTED', 'CANCELLED') " +
            "AND (lr.startDate <= :endDate AND lr.endDate >= :startDate)")
    List<LeaveRequest> findOverlappingRequests(
            @Param("empId") Integer empId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    // Lọc đơn theo phòng (Department) và trạng thái
    @Query("SELECT lr FROM LeaveRequest lr " +
            "JOIN lr.employee e " +
            "JOIN e.department d " +
            "WHERE d.manager.empID = :managerId " + // Dựa vào cấu trúc DB: Department có managerID
            "AND (:status IS NULL OR lr.status = :status) " + // Nếu không truyền status thì lấy tất cả
            "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findRequestsForManager(@Param("managerId") Integer managerId,
                                              @Param("status") LeaveRequest.Status status);

    @EntityGraph(attributePaths = {"employee", "leaveType"})
    Optional<LeaveRequest> findByRequestID(Integer requestID);
}