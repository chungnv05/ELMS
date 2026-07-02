package org.elms.leavemanagementsystem.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

// Trả token và role khi đăng nhập
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String role;
}