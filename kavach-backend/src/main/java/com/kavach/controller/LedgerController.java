package com.kavach.controller;

import com.kavach.dto.LedgerProofResponse;
import com.kavach.dto.LedgerStatsDto;
import com.kavach.dto.LedgerVerifyResponse;
import com.kavach.dto.PageResponse;
import com.kavach.model.LedgerRecord;
import com.kavach.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ledger")
public class LedgerController {

    @Autowired
    private LedgerService ledgerService;

    @GetMapping
    public ResponseEntity<PageResponse<LedgerRecord>> getRecords(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ledgerService.getRecords(category, search, page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<LedgerStatsDto> getStats() {
        return ResponseEntity.ok(ledgerService.getStats());
    }

    @PostMapping("/verify")
    public ResponseEntity<LedgerVerifyResponse> verify() {
        return ResponseEntity.ok(ledgerService.verifyChainIntegrity());
    }

    @GetMapping("/proof")
    public ResponseEntity<LedgerProofResponse> generateProof() {
        LedgerProofResponse proof = ledgerService.generateProof();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"merkle-proof.json\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(proof);
    }
}
