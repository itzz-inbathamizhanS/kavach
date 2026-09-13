package com.kavach.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evidence {
    private String actor;
    private String ruleApplied;
    private String duration;
    private String checksum;
}
