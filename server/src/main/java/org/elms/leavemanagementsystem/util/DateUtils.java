package org.elms.leavemanagementsystem.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

public class DateUtils {

    public static BigDecimal calculateWorkDays(LocalDate startDate, LocalDate endDate) {
        BigDecimal workDays = BigDecimal.ZERO;
        LocalDate date = startDate;

        while (!date.isAfter(endDate)) {
            // Kiểm tra: Không phải thứ 7, không phải CN, và không nằm trong danh sách ngày lễ
            if (date.getDayOfWeek() != DayOfWeek.SATURDAY &&
                    date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workDays = workDays.add(BigDecimal.ONE);
            }
            date = date.plusDays(1);
        }
        return workDays;
    }
}