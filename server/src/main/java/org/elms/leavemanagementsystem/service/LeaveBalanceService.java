package org.elms.leavemanagementsystem.service;

import org.elms.leavemanagementsystem.dto.response.LeaveBalanceReponse;
import org.elms.leavemanagementsystem.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.elms.leavemanagementsystem.entity.LeaveBalance;
import org.elms.leavemanagementsystem.exception.ResourceNotFoundException;
import org.elms.leavemanagementsystem.repository.LeaveBalanceRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeaveBalanceService(LeaveBalanceRepository leaveBalanceRepository) {
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    @Transactional
    public void updatePendingDays(Integer empId, Integer year, BigDecimal requestDays) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép năm " + year + "!"));

        // Tính toán số ngày phép THỰC SỰ có thể dùng
        BigDecimal totalUsedAndPending = balance.getUsedDays().add(balance.getPendingDays());
        BigDecimal strictlyAvailableDays = balance.getTotalDays().subtract(totalUsedAndPending);

        if (strictlyAvailableDays.compareTo(requestDays) < 0) {
            throw new BusinessException("Số ngày phép còn lại không đủ để tạo đơn!");
        }

        // Thêm vào số ngày ở PENDING
        balance.setPendingDays(balance.getPendingDays().add(requestDays));
        leaveBalanceRepository.save(balance);
    }

    // Chuyển phép từ PENDING sang USED khi đơn được duyệt
    @Transactional
    public void commitUsedDays(Integer empId, Integer year, BigDecimal daysToCommit) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép năm " + year + "!"));

        // Chuyển số ngày từ PENDING sang USED
        balance.setPendingDays(balance.getPendingDays().subtract(daysToCommit));
        balance.setUsedDays(balance.getUsedDays().add(daysToCommit));

        leaveBalanceRepository.save(balance);
    }

    // Hoàn trả phép Pending về Total khi đơn bị TỪ CHỐI hoặc HỦY BỎ
    @Transactional
    public void refundPendingDays(Integer empId, Integer year, BigDecimal daysToRefund) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép năm " + year + "!"));

        // Trừ ở PENDING
        balance.setPendingDays(balance.getPendingDays().subtract(daysToRefund));

        leaveBalanceRepository.save(balance);
    }

    public LeaveBalanceReponse getLeaveBalance(Integer empId, Integer year) {
        LeaveBalance leaveBalance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép năm " + year + "!"));

        return LeaveBalanceReponse.builder()
                .year(leaveBalance.getId().getYear())
                .totalDays(leaveBalance.getTotalDays())
                .usedDays(leaveBalance.getUsedDays())
                .pendingDays(leaveBalance.getPendingDays())
                .build();

    }
}
