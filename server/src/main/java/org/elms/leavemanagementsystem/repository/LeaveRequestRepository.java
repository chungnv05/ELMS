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
            "WHERE d.manager.empID = :managerId " +
            "AND (:status IS NULL OR lr.status = :status) " +
            "ORDER BY lr.createdAt DESC")
    List<LeaveRequest> findRequestsForManager(@Param("managerId") Integer managerId,
                                              @Param("status") LeaveRequest.Status status);

    // Lấy đơn kèm nhân viên
    @EntityGraph(attributePaths = {"employee", "leaveType"})
    Optional<LeaveRequest> findByRequestID(Integer requestID);

    @Query("SELECT r FROM LeaveRequest r WHERE r.employee.empID = :empId " +
            "AND (:status IS NULL OR r.status = :status) " +
            "ORDER BY r.createdAt DESC")
    List<LeaveRequest> findLeaveRequestsByEmployeeAndStatus(
            @Param("empId") Integer empId,
            @Param("status") LeaveRequest.Status status);


    // Tìm đơn trùng lịch trừ đơn đang xét
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.empID = :empId " +
            "AND lr.requestID <> :requestId " +
            "AND lr.status NOT IN ('REJECTED', 'CANCELLED') " +
            "AND (lr.startDate <= :endDate AND lr.endDate >= :startDate)")
    List<LeaveRequest> findOverlappingRequestsExcludingCurrent(@Param("empId") Integer empId,
                                                               @Param("requestId") Integer requestId,
                                                               @Param("startDate") LocalDate startDate,
                                                               @Param("endDate") LocalDate endDate);

    // Lấy những đơn nghỉ phép của nhân viên trong tháng để hiển thị trên lịch
    @Query("SELECT l FROM LeaveRequest l WHERE l.employee.empID = :empId AND l.status != 'REJECTED' " +
            "AND l.startDate <= :endOfMonth AND l.endDate >= :startOfMonth")
    List<LeaveRequest> findLeavesForCalendar(
            @Param("empId") Integer empId,
            @Param("startOfMonth") LocalDate startOfMonth,
            @Param("endOfMonth") LocalDate endOfMonth);

    // Đếm đơn theo trạng thái
    int countByStatus(LeaveRequest.Status status);

    // Đếm số nhân viên đang nghỉ phép hôm nay
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' " +
            "AND :today BETWEEN l.startDate AND l.endDate")
    int countOnLeaveToday(@Param("today") LocalDate today);

    // Đếm số đơn trong tháng
    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.startDate <= :endOfMonth " +
            "AND l.endDate >= :startOfMonth")
    int countRequestsThisMonth(@Param("startOfMonth") LocalDate startOfMonth, @Param("endOfMonth") LocalDate endOfMonth);
}