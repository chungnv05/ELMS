package org.elms.leavemanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Leave_Evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "evidenceID")
    private Integer evidenceID;

    @Column(name = "fileName", nullable = false, length = 255)
    private String fileName;

    @Column(name = "filePath", nullable = false, length = 512)
    private String filePath;

    @Column(name = "fileSize")
    private Long fileSize;

    @Column(name = "mimeType", length = 100)
    private String mimeType;

    @Column(name = "uploadedAt", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // Quan hệ ngược về LeaveRequest
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requestID", nullable = false)
    private LeaveRequest leaveRequest;

    @PrePersist
    public void prePersist() {
        uploadedAt = LocalDateTime.now();
    }
}