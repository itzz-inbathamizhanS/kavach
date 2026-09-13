package com.kavach.controller;

import com.kavach.dto.ApprovalActionRequest;
import com.kavach.model.ApprovalRequest;
import com.kavach.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    @Autowired
    private ApprovalService approvalService;

    @GetMapping
    public ResponseEntity<List<ApprovalRequest>> getPendingApprovals() {
        return ResponseEntity.ok(approvalService.getPendingApprovals());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApprovalRequest> approve(
            @PathVariable String id, 
            @RequestBody ApprovalActionRequest request,
            Authentication authentication) {
        // authentication.getName() is the user ID from JWT
        return ResponseEntity.ok(approvalService.approve(id, request, "analyst.lead@defense.internal")); // Hardcoded for demo/simplicity if no DB user lookup
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApprovalRequest> reject(
            @PathVariable String id, 
            @RequestBody ApprovalActionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(approvalService.reject(id, request, "analyst.lead@defense.internal"));
    }

    @PostMapping("/seed")
    public ResponseEntity<String> seed() {
        approvalService.seedApprovals();
        return ResponseEntity.ok("Seeded");
    }
}
