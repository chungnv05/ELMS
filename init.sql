

INSERT INTO employee (emp_code, full_name, email, password, role, is_active, hired_date, departmentid) 
VALUES (
    'NV001', 
    'Nguyễn Văn Test', 
    'test@congty.com', 
    '$2a$12$rDL0u9Q4bwRwWfmnXIuqCOFXP6gCgjh//HCnfAeKoIGpUP2t51m16', -- Mật khẩu là: 123456
    'HR_ADMIN', 
    TRUE, 
    '2023-01-01', 
    1
);

INSERT INTO employee (emp_code, full_name, email, password, role, is_active, hired_date, departmentid) 
VALUES (
    'LD001', 
    'Nguyễn Văn Chung', 
    'chungnv05.stu@gmail.com', 
    '$2a$12$iihdSLW8RHEqb5wxdporOObbtgskJ2IWxI1E3jfJphtCPbm6mfRr.', -- Mật khẩu là: 123456
    'HIGH_LEVEL_MANAGER', 
    TRUE, 
    '2023-01-01', 
    1
);

INSERT INTO leave_balance (empID, year, total_days, used_days, pending_days)
VALUES (
    (SELECT empID FROM employee WHERE email = 'test@congty.com'), 
    2026, 
    12.0, 
    0.0, 
    0.0
);