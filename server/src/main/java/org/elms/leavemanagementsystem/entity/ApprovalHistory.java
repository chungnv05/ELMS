package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Approval_History")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {
    public enum Action {
        SUBMITTED, APPROVED, REJECTED, CANCELLED, UPDATED
    }

    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approvalID")
    private Integer approvalID;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private Action action;

    @Enumerated(EnumType.STRING)
    @Column(name = "statusBefore", length = 20)
    private Status statusBefore; // NULL khi action = SUBMITTED

    @Enumerated(EnumType.STRING)
    @Column(name = "statusAfter", nullable = false, length = 20)
    private Status statusAfter;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "createdAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requestID", nullable = false)
    private LeaveRequest leaveRequest;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actorID", nullable = false)
    private Employee actor;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

}
