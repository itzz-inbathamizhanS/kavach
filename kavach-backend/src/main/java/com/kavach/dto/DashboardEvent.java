package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardEvent {
    private String time;
    private String event;
    private String id;
    private String tier;
    private String status;
    private String statusType; // "success", "danger", "warning"
    private String category; // "enforcement", "advisory"
}
