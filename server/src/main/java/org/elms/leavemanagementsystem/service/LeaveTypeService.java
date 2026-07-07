package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.request.LeaveTypeRequest;
import org.elms.leavemanagementsystem.dto.response.LeaveTypeResponse;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveTypeService {
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public List<LeaveTypeResponse> getAllLeaveTypes() {
        return leaveTypeRepository.findAll().stream().map(type ->
                LeaveTypeResponse.builder()
                        .typeId(type.getTypeID())
                        .name(type.getName())
                        .isPaid(type.getIsPaid())
                        .requiresEvidence(type.getRequiresEvidence())
                        .defaultDays(type.getDefaultDays())
                        .isActive(type.getIsActive())
                        .status(type.getStatus().name())
                        .build()
        ).collect(Collectors.toList());
    }

    public List<LeaveTypeResponse> getActiveLeaveTypes() {
        List<LeaveType> activeTypes = leaveTypeRepository.findByIsActiveTrue();

        return activeTypes.stream()
                .map(type -> LeaveTypeResponse.builder()
                        .typeId(type.getTypeID())
                        .name(type.getName())
                        .build())
                .collect(Collectors.toList());
    }

    public LeaveType getLeaveTypeById(Integer typeId) {
        return leaveTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại nghỉ phép hợp lệ"));
    }

    // Tạo loại nghỉ mới
    @Transactional
    public void createLeaveType(LeaveTypeRequest request) {
        LeaveType leaveType = new LeaveType();
        leaveType.setName(request.getName());
        leaveType.setIsPaid(request.getIsPaid());
        leaveType.setRequiresEvidence(request.getRequiresEvidence());
        leaveType.setDefaultDays(request.getDefaultDays());
        leaveType.setIsActive(true);
        leaveType.setStatus(LeaveType.Status.PENDING);

        leaveTypeRepository.save(leaveType);
    }

    // Toggle trạng thái
    @Transactional
    public void toggleStatus(Integer id) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại nghỉ phép!")); // Dùng BusinessException nếu bạn đã định nghĩa

        leaveType.setIsActive(!leaveType.getIsActive());
        leaveTypeRepository.save(leaveType);
    }

    // Duyệt thêm loại nghỉ phép
    @Transactional
    public void approveLeaveType(Integer id, boolean isApproved) {
        LeaveType leaveType = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy loại nghỉ phép!"));

        // Nếu chưa ở trạng thái PENDING thì không cho duyệt
        if (leaveType.getStatus() != LeaveType.Status.PENDING) {
            throw new BusinessException("Loại nghỉ phép này đã được xử lý!");
        }

        if (isApproved) {
            leaveType.setStatus(LeaveType.Status.APPROVED);
            leaveType.setIsActive(true); // Chính thức có hiệu lực
        } else {
            leaveType.setStatus(LeaveType.Status.REJECTED);
            leaveType.setIsActive(false);
        }

        leaveTypeRepository.save(leaveType);
    }
}
