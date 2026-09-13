package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "advisories")
public class Advisory {

    @Id
    private String id;

    @Indexed
    private String source; // "CERT-In", "CISA KEV", "NVD Feed", "Shadowserver"

    private String title;

    private String cve;

    private String description;

    @Indexed
    private Instant timestamp;

    @Indexed
    private String status; // "Pending", "Verified", "Reviewed"

    private double confidenceScore;
}
