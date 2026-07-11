package org.elms.leavemanagementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableAsync
public class ElmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ElmsApplication.class, args);
    }

}
