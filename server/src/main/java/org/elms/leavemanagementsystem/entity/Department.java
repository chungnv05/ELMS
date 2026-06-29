package org.elms.leavemanagementsystem.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "Department")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "departmentID")
    private Integer departmentID;

    @Column(name = "departmentCode", nullable = false, unique = true, length = 20)
    private String departmentCode;

    @Column(name = "departmentName", nullable = false, length = 100)
    private String departmentName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Quan hệ quản lý bởi 1 trưởng phòng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "managerID")
    private Employee manager;

    // Một phòng ban có nhiều nhân viên
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Employee> employees;
}