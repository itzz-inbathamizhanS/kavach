package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EnforcementStatsDto {
    private long total;
    private String automatedRate;
    private long activeTierBlocks;
    private long manualReviews;
    private long addedToday;
}
