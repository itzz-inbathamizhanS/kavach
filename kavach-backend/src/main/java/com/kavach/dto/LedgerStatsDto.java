package com.kavach.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LedgerStatsDto {
    private long totalRecords;
    private String chainIntegrity;
    private long latestBlock;
    private String merkleRoot;
    private long committedToday;
    private String lastBlockAge;
}
