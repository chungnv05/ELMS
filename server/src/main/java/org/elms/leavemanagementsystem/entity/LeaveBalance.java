package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "Leave_Balance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @EmbeddedId
    private LeaveBalanceId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("empID")  // Ánh xạ empID trong EmbeddedId
    @JoinColumn(name = "empID")
    private Employee employee;

    @Column(name = "totalDays", nullable = false, precision = 5, scale = 1)
    private BigDecimal totalDays = BigDecimal.ZERO;

    @Column(name = "usedDays", nullable = false, precision = 5, scale = 1)
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pendingDays", nullable = false, precision = 5, scale = 1)
    private BigDecimal pendingDays = BigDecimal.ZERO;

}