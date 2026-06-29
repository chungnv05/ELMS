package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Leave_Request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {


    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requestID")
    private Integer requestID;

    @Column(name = "requestCode", nullable = false, unique = true, length = 20)
    private String requestCode;

    @Column(name = "startDate", nullable = false)
    private LocalDate startDate;

    @Column(name = "endDate", nullable = false)
    private LocalDate endDate;

    @Column(name = "totalDays", nullable = false, precision = 5, scale = 1)
    private BigDecimal totalDays;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "rejectionReason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "approvedAt")
    private LocalDateTime approvedAt;

    // Một nhân viên có thể tạo nhiều dơn Employee(1) - (N)LeaveRequest
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empID", nullable = false)
    private Employee employee;

    // Một loại phép có thể áp dụng cho nhiều đơn LeaveType(1) - (N)LeaveRequest
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "typeID", nullable = false)
    private LeaveType leaveType;


    // Lịch sử hành động của đơn xin nghỉ phép LeaveRequest(1) - (N)ApprovalHistory
    @OneToMany(mappedBy = "leaveRequest",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @OrderBy("createdAt ASC")  // Hiển thị lịch sử theo thứ tự thời gian
    private List<ApprovalHistory> approvalHistories;

    // Một Leave request có thể có nhiều minh chứng LeaveRequest(1) - (N)ApprovalHistory
    @OneToMany(mappedBy = "leaveRequest",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<LeaveEvidence> evidences;



}