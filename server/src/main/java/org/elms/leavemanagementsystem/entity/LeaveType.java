package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Leave_Type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveType {

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "typeID")
    private Integer typeID;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "isPaid", nullable = false)
    private Boolean isPaid = true;

    @Column(name = "requiresEvidence", nullable = false)
    private Boolean requiresEvidence = false;

    @Column(name = "defaultDays", nullable = false)
    private Integer defaultDays = 0;

    @Column(name = "isActive", nullable = false)
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    // Quan hệ ngược: 1 loại phép áp dụng cho nhiều đơn
    @OneToMany(mappedBy = "leaveType", fetch = FetchType.LAZY)
    private List<LeaveRequest> leaveRequests;
}