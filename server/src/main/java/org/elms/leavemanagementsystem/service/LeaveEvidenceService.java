package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.entity.LeaveEvidence;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.exception.FileStorageException;
import org.elms.leavemanagementsystem.repository.LeaveEvidenceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveEvidenceService {
    private final LeaveEvidenceRepository leaveEvidenceRepository;
    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    public LeaveEvidenceService(LeaveEvidenceRepository leaveEvidenceRepository) {
        this.leaveEvidenceRepository = leaveEvidenceRepository;
    }

    public void saveEvidence(LeaveRequestForm form, LeaveRequest leaveRequest) {
        if (form.getEvidenceFiles() != null && !form.getEvidenceFiles().isEmpty() && !form.getEvidenceFiles().get(0).isEmpty()) {
            List<LeaveEvidence> evidenceList = new ArrayList<>();

            // 8.1. Kiểm tra và tạo thư mục lưu trữ nếu chưa tồn tại
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(UPLOAD_DIR);
            if (!java.nio.file.Files.exists(uploadPath)) {
                try {
                    java.nio.file.Files.createDirectories(uploadPath);
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Không thể tạo thư mục lưu trữ file: " + e.getMessage());
                }
            }

            // Duyệt qua từng file và tiến hành lưu
            for (MultipartFile file : form.getEvidenceFiles()) {
                if (file.isEmpty()) continue;

                String originalFileName = file.getOriginalFilename();
                // Dùng UUID nối với tên gốc để tránh việc 2 nhân viên tải lên file trùng tên nhau
                String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
                java.nio.file.Path targetLocation = uploadPath.resolve(uniqueFileName);

                try {
                    // Thực hiện lưu file vật lý xuống ổ cứng
                    java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                } catch (java.io.IOException e) {
                    throw new FileStorageException("Lỗi khi lưu file đính kèm: " + originalFileName, e);
                }

                // Lưu thông tin Metadata vào cơ sở dữ liệu
                LeaveEvidence evidence = new LeaveEvidence();
                evidence.setFileName(originalFileName);
                // Lưu toàn bộ đường dẫn vật lý
                evidence.setFilePath(targetLocation.toString());
                evidence.setFileSize(file.getSize());
                evidence.setMimeType(file.getContentType());
                evidence.setLeaveRequest(leaveRequest);
                evidenceList.add(evidence);
            }
            leaveEvidenceRepository.saveAll(evidenceList);
        }
    }
}
