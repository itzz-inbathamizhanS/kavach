package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "indicators")
public class Indicator {

    @Id
    private String id;

    private String type; // "IP address", "Domain", "File hash (SHA-256)"

    @Indexed(unique = true)
    private String value;

    private String source;

    private double confidenceScore;

    @Indexed
    private String status; // "Enforced", "Verified", "Needs review", "Pending"

    @CreatedDate
    private Instant createdAt;

    @Indexed(expireAfterSeconds = 0)
    private Instant ttlExpiry;
}
