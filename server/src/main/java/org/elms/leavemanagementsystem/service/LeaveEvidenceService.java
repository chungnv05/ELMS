package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.entity.LeaveEvidence;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.FileStorageException;
import org.elms.leavemanagementsystem.repository.LeaveEvidenceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

    public void saveEvidence(List<MultipartFile> evidenceFiles, LeaveRequest leaveRequest) {
        if (evidenceFiles == null || evidenceFiles.isEmpty()) return;

        // 1. Đảm bảo thư mục lưu trữ tồn tại
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new FileStorageException("Không thể tạo thư mục lưu trữ file", e);
        }

        List<LeaveEvidence> evidenceList = new ArrayList<>();

        for (MultipartFile file : evidenceFiles) {
            if (file.isEmpty()) continue;

            // 2. Tạo tên file duy nhất (UUID + Tên gốc)
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = uploadPath.resolve(uniqueFileName);

            // 3. Lưu file vật lý
            try {
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new FileStorageException("Lỗi khi lưu file: " + originalFileName, e);
            }

            // 4. Lưu Metadata vào DB
            LeaveEvidence evidence = new LeaveEvidence();
            evidence.setFileName(uniqueFileName); // QUAN TRỌNG: Lưu tên file đã đổi
            evidence.setFilePath(uniqueFileName); // Chỉ lưu tên file (Relative Path)
            evidence.setFileSize(file.getSize());
            evidence.setMimeType(file.getContentType());
            evidence.setLeaveRequest(leaveRequest);

            evidenceList.add(evidence);
        }

        if (!evidenceList.isEmpty()) {
            leaveEvidenceRepository.saveAll(evidenceList);
        }
    }

    @Transactional
    public void deleteEvidence(List<Integer> evidenceIds, LeaveRequest leaveRequest) {
        if (evidenceIds == null || evidenceIds.isEmpty()) return;


        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();

        for (Integer id : evidenceIds) {
            leaveEvidenceRepository.findById(id).ifPresent(evidence -> {

                // Check file có đúng là của đơn nghỉ phép đang xét
                if (evidence.getLeaveRequest().getRequestID().equals(leaveRequest.getRequestID())) {

                    try {
                        Path filePath = uploadPath.resolve(evidence.getFilePath()).normalize();
                        Files.deleteIfExists(filePath);

                        leaveRequest.getEvidences().remove(evidence);
                        leaveEvidenceRepository.delete(evidence);

                    } catch (IOException e) {
                        throw new FileStorageException("Lỗi hệ thống khi xóa file vật lý: " + evidence.getFileName(), e);
                    }
                } else {
                    throw new BusinessException("Không có quyền xóa file này!");
                }
            });
        }
    }
}