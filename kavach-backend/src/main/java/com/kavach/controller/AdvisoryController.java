package com.kavach.controller;

import com.kavach.dto.AdvisoryStatsDto;
import com.kavach.dto.MarkReviewedRequest;
import com.kavach.dto.PageResponse;
import com.kavach.model.Advisory;
import com.kavach.service.AdvisoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/advisories")
public class AdvisoryController {

    @Autowired
    private AdvisoryService advisoryService;

    @GetMapping
    public ResponseEntity<PageResponse<Advisory>> getAdvisories(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(advisoryService.getAdvisories(source, search, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdvisoryStatsDto> getStats() {
        return ResponseEntity.ok(advisoryService.getStats());
    }

    @Autowired
    private com.kavach.service.ThreatIngestionService threatIngestionService;

    @PatchMapping("/mark-reviewed")
    public ResponseEntity<?> markReviewed(@RequestBody MarkReviewedRequest request) {
        advisoryService.markReviewed(request.getIds());
        return ResponseEntity.ok(Map.of("updated", request.getIds().size()));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncFeeds() {
        threatIngestionService.syncCisaKev();
        return ResponseEntity.ok(Map.of("message", "CISA KEV synchronization triggered successfully."));
    }

    @PostMapping
    public ResponseEntity<Advisory> createAdvisory(@RequestBody Advisory advisory) {
        return ResponseEntity.ok(advisoryService.createAdvisory(advisory));
    }
}
