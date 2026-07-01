package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.response.LeaveTypeResponse;
import org.elms.leavemanagementsystem.entity.LeaveType;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveTypeService {
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
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
}
