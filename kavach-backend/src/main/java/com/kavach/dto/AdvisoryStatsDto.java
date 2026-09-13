package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdvisoryStatsDto {
    private long total;
    private long unreviewed;
    private String avgTriageMinutes;
    private long criticalIndicators;
}
