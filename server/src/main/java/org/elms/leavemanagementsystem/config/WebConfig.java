package org.elms.leavemanagementsystem.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // Cho phép nguồn từ frontend
                .allowedOrigins("http://localhost:5173")
                // Cho phép các phương thức HTTP phổ biến
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // Cho phép gửi kèm cookie/session/header xác thực
                .allowCredentials(true)
                .maxAge(3600);
    }



    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cấu hình: Khi truy cập URL bắt đầu bằng /api/files/
        // Hệ thống sẽ tìm file trong thư mục uploadDir
        registry.addResourceHandler("/api/files/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }
}