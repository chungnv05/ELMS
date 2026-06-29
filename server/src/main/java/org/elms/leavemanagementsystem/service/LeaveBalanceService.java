package org.elms.leavemanagementsystem.service;

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

    // Chuyển phép từ PENDING sang USED khi đơn được duyệt
    @Transactional
    public void commitUsedDays(Integer empId, Integer year, BigDecimal daysToCommit) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép của nhân viên tại năm " + year));

        // Chuyển số ngày từ PENDING sang USED
        balance.setPendingDays(balance.getPendingDays().subtract(daysToCommit));
        balance.setUsedDays(balance.getUsedDays().add(daysToCommit));

        leaveBalanceRepository.save(balance);
    }

    // Hoàn trả phép Pending về Total khi đơn bị TỪ CHỐI hoặc HỦY BỎ
    @Transactional
    public void refundPendingDays(Integer empId, Integer year, BigDecimal daysToRefund) {
        LeaveBalance balance = leaveBalanceRepository.findByEmployee_EmpIDAndId_Year(empId, year)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quỹ phép của nhân viên năm " + year));

        // Chỉ trừ đi ở pending (vì lúc tạo đơn đã cộng vào pending rồi)
        balance.setPendingDays(balance.getPendingDays().subtract(daysToRefund));

        leaveBalanceRepository.save(balance);
    }
}
