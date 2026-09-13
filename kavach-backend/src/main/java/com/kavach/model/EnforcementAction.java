package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "enforcement_actions")
public class EnforcementAction {

    @Id
    private String id;

    private Instant timestamp;

    private String indicatorValue;

    private String tier;

    private String actionTaken;

    private String status; // "Enforced", "Pending", "Needs review"

    private Evidence evidence;
}
