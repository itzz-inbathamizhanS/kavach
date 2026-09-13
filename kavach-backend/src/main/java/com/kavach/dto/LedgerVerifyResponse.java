package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LedgerVerifyResponse {
    private boolean valid;
    private long blocksChecked;
    private int nodesVerified;
    private String message;
}
