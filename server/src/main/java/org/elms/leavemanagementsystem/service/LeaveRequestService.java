package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveRequestForm;
import org.elms.leavemanagementsystem.entity.*;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.FileStorageException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveEvidenceRepository leaveEvidenceRepository;

    @Value("${file.upload-dir}")
    private String UPLOAD_DIR;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               LeaveBalanceRepository leaveBalanceRepository,
                               ApprovalHistoryRepository approvalHistoryRepository,
                               EmployeeRepository employeeRepository,
                               LeaveTypeRepository leaveTypeRepository,
                               LeaveEvidenceRepository leaveEvidenceRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveEvidenceRepository = leaveEvidenceRepository;
    }

    @Transactional
    public void createLeaveRequest(Integer currentEmpId, LeaveRequestForm form) {

        // Lấy thông tin Employee và LeaveType
        Employee employee = employeeRepository.findById(currentEmpId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin nhân viên!"));
        LeaveType type = leaveTypeRepository.findById(form.getTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại nghỉ phép!"));

        // Validate thời gian hợp lệ
        if (form.getStartDate().isAfter(form.getEndDate())) {
            throw new BusinessException("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
        }

        // Kiểm tra trùng lịch
        List<LeaveRequest> overlappingRequests = leaveRequestRepository.findOverlappingRequests(currentEmpId, form.getStartDate(), form.getEndDate());
        if (!overlappingRequests.isEmpty()) {
            throw new BusinessException("Bạn đã có đơn nghỉ phép khác trong khoảng thời gian này!");
        }

        // Bắt buộc có minh chứng nếu loại nghỉ phép yêu cầu
        if (Boolean.TRUE.equals(type.getRequiresEvidence())) {
            if (form.getEvidenceFiles() == null || form.getEvidenceFiles().isEmpty() || form.getEvidenceFiles().get(0).isEmpty()) {
                throw new BusinessException("Loại nghỉ phép '" + type.getName() + "' bắt buộc phải nộp giấy tờ minh chứng!");
            }
        }

        // Tính số ngày nghỉ
        long daysBetween = ChronoUnit.DAYS.between(form.getStartDate(), form.getEndDate()) + 1;
        BigDecimal requestDays = BigDecimal.valueOf(daysBetween);

        if (requestDays.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Số ngày xin nghỉ không hợp lệ!");
        }

        // Kiểm tra quỹ phép
        int currentYear = Year.now().getValue();
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(currentEmpId, currentYear)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép năm " + currentYear + " của bạn!"));

        BigDecimal availableDays = balance.getTotalDays().subtract(balance.getUsedDays()).subtract(balance.getPendingDays());
        if (availableDays.compareTo(requestDays) < 0) {
            throw new BusinessException("Số ngày phép còn lại (" + availableDays + ") không đủ để tạo đơn (" + requestDays + " ngày)!");
        }

        // Trừ quỹ phép và thêm vào số ngày đang chờ duyệt
        balance.setPendingDays(balance.getPendingDays().add(requestDays));
        leaveBalanceRepository.save(balance);


        LocalDateTime now = LocalDateTime.now();
        LeaveRequest request = new LeaveRequest();
        request.setRequestCode("LR-" + currentYear + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        request.setEmployee(employee);
        request.setLeaveType(type);
        request.setStartDate(form.getStartDate());
        request.setEndDate(form.getEndDate());
        request.setTotalDays(requestDays);
        request.setReason(form.getReason());
        request.setStatus(LeaveRequest.Status.PENDING);
        request.setCreatedAt(now);
        request.setUpdatedAt(now);

        // Lưu trước vào db để có ID tham chiếu cho evidence và history
        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        //  Xử lý File đính kèm
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
                evidence.setLeaveRequest(savedRequest);
                evidenceList.add(evidence);
            }
            leaveEvidenceRepository.saveAll(evidenceList);
        }

        // Ghi vào ApprovalHistory
        ApprovalHistory history = new ApprovalHistory();
        history.setLeaveRequest(savedRequest);
        history.setActor(employee);
        history.setAction(ApprovalHistory.Action.SUBMITTED);
        history.setStatusAfter(ApprovalHistory.Status.PENDING);
        approvalHistoryRepository.save(history);
    }
}