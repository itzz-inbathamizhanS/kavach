package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "approval_requests")
public class ApprovalRequest {

    @Id
    private String id;

    private String indicatorValue;

    private String type; // "Ingress Block", "Workload Quarantine"

    private String threat;

    private double confidenceScore;

    private String requestedBy;

    @CreatedDate
    private Instant requestedAt;

    private String status; // "PENDING", "APPROVED", "REJECTED"

    private String analystNotes;

    private String resolvedBy;

    private Instant resolvedAt;
}
