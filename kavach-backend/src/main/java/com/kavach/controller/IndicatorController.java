package com.kavach.controller;

import com.kavach.dto.IndicatorStatsDto;
import com.kavach.dto.PageResponse;
import com.kavach.model.Indicator;
import com.kavach.service.IndicatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/indicators")
public class IndicatorController {

    @Autowired
    private IndicatorService indicatorService;

    @GetMapping
    public ResponseEntity<PageResponse<Indicator>> getIndicators(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(indicatorService.getIndicators(search, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<IndicatorStatsDto> getStats() {
        return ResponseEntity.ok(indicatorService.getStats());
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = indicatorService.exportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"indicators.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
