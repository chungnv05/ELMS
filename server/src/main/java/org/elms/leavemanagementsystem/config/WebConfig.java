package org.elms.leavemanagementsystem.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Áp dụng cho tất cả các đường dẫn bắt đầu bằng /api/
        registry.addMapping("/api/**")
                // Cho phép Angular ở cổng 4200 gọi đến
                .allowedOrigins("http://localhost:3000")
                // Cho phép các phương thức phổ biến
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Cho phép các header cần thiết (như Authorization để làm JWT sau này)
                .allowedHeaders("*")
                // Cho phép gửi kèm cookie/session/header xác thực
                .allowCredentials(true)
                .maxAge(3600);
    }
}