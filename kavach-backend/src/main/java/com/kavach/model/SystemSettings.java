package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Document(collection = "system_settings")
public class SystemSettings {

    @Id
    private String id;

    private int confidenceThreshold; // 50-100

    private Map<String, Boolean> feeds;

    private Map<String, Boolean> policies;

    private Instant updatedAt;

    private String updatedBy;
}
