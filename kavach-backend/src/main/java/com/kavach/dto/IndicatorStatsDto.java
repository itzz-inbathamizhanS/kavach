package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class IndicatorStatsDto {
    private long total;
    private long highConfidence;
    private long activeBlocks;
    private long addedToday;
}
