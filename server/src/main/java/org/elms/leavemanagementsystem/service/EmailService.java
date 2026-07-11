package org.elms.leavemanagementsystem.service;

import lombok.RequiredArgsConstructor;
import org.elms.leavemanagementsystem.entity.LeaveRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendLeaveRequestStatusEmail(String employeeEmail, String fullName , LocalDate startDate, LocalDate endDate, String status, String type, String comment) {


        String subject = "[ELMS] Kết quả phê duyệt đơn nghỉ phép: " + status;

        StringBuilder body = new StringBuilder();
        body.append("Xin chào ").append(fullName).append(",\n\n");
        body.append("Đơn xin nghỉ phép của bạn (").append(type).append(") đã được xử lý.\n");
        body.append("Trạng thái: ").append(status).append("\n");
        body.append("Thời gian: ").append(startDate).append(" đến ").append(endDate).append("\n");

        if (comment != null && !comment.isEmpty()) {
            body.append("\nLời nhắn từ quản lý: ").append(comment).append("\n");
        }

        body.append("\nTrân trọng!");

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(employeeEmail);
        message.setSubject(subject);
        message.setText(body.toString());

        try {
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Lỗi gửi email: " + e.getMessage());
        }
    }
}