package com.kavach.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "ledger_records")
public class LedgerRecord {

    @Id
    private String id;

    private Instant timestamp;

    @Indexed(unique = true)
    private long blockNumber;

    private String hash; // SHA-256 of previousHash + blockNumber + description + timestamp

    private String previousHash; // "0" for genesis block

    private String description;

    private String scope;

    private String actor;

    private String actorSub;

    private String actorIcon;

    private String category; // "enforcement", "policy"

    private String status; // "Verified"
}
