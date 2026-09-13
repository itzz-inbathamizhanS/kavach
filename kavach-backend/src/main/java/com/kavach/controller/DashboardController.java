package com.kavach.controller;

import com.kavach.dto.DashboardEvent;
import com.kavach.dto.DashboardStats;
import com.kavach.dto.PageResponse;
import com.kavach.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/events")
    public ResponseEntity<PageResponse<DashboardEvent>> getEvents(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(dashboardService.getEvents(filter, page, size));
    }
}
