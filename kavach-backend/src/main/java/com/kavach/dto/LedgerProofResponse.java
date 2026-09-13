package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LedgerProofResponse {
    private String chain;
    private long height;
    private String merkleRoot;
    private List<String> consensusNodes;
    private String timestamp;
}
