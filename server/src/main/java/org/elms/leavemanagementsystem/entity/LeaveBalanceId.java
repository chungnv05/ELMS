package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode  // Bắt buộc với Embeddable để JPA so sánh đúng
public class LeaveBalanceId implements Serializable {

    @Column(name = "empID")
    private Integer empID;

    // Partial key — year định danh LeaveBalance trong phạm vi 1 Employee
    @Column(name = "year")
    private Integer year;
}