package com.kavach.controller;

import com.kavach.dto.EnforcementStatsDto;
import com.kavach.dto.PageResponse;
import com.kavach.model.EnforcementAction;
import com.kavach.service.EnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enforcement")
public class EnforcementController {

    @Autowired
    private EnforcementService enforcementService;

    @GetMapping
    public ResponseEntity<PageResponse<EnforcementAction>> getActions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(enforcementService.getActions(status, search, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<EnforcementStatsDto> getStats() {
        return ResponseEntity.ok(enforcementService.getStats());
    }
}
