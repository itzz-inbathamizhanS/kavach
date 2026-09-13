package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStats {
    private long advisoriesToday;
    private long indicatorsVerified;
    private long actionsEnforced;
    private long pendingApprovals;
}
