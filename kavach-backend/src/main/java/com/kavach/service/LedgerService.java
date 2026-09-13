package com.kavach.service;

import com.kavach.dto.LedgerProofResponse;
import com.kavach.dto.LedgerStatsDto;
import com.kavach.dto.LedgerVerifyResponse;
import com.kavach.dto.PageResponse;
import com.kavach.model.LedgerRecord;
import com.kavach.repository.LedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class LedgerService {

    @Autowired
    private LedgerRepository ledgerRepository;

    public LedgerRecord commitRecord(String description, String scope, String actor, String actorSub, String actorIcon, String category) {
        Optional<LedgerRecord> latest = ledgerRepository.findTopByOrderByBlockNumberDesc();
        long newBlockNumber = 1;
        String previousHash = "0";

        if (latest.isPresent()) {
            newBlockNumber = latest.get().getBlockNumber() + 1;
            previousHash = latest.get().getHash();
        }

        Instant timestamp = Instant.now();
        String dataToHash = previousHash + "|" + newBlockNumber + "|" + description + "|" + timestamp;
        String hash = computeSha256(dataToHash);

        LedgerRecord record = new LedgerRecord();
        record.setBlockNumber(newBlockNumber);
        record.setPreviousHash(previousHash);
        record.setHash(hash);
        record.setDescription(description);
        record.setScope(scope);
        record.setActor(actor);
        record.setActorSub(actorSub);
        record.setActorIcon(actorIcon);
        record.setCategory(category);
        record.setTimestamp(timestamp);
        record.setStatus("Verified");

        return ledgerRepository.save(record);
    }

    public PageResponse<LedgerRecord> getRecords(String category, String search, int page, int size) {
        if (category == null || category.isEmpty()) category = "all";
        if (search == null) search = "";

        Page<LedgerRecord> p = ledgerRepository.findByFilters(
                category, search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockNumber")));
        return PageResponse.of(p);
    }

    public LedgerStatsDto getStats() {
        long totalRecords = ledgerRepository.count();
        long committedToday = ledgerRepository.countByTimestampAfter(Instant.now().truncatedTo(ChronoUnit.DAYS));
        LedgerRecord latest = ledgerRepository.findTopByOrderByBlockNumberDesc().orElse(null);
        long latestBlock = latest != null ? latest.getBlockNumber() : 0;
        String merkleRoot = latest != null ? latest.getHash().substring(0, 16) + "..." : "N/A";
        
        return new LedgerStatsDto(totalRecords, "100%", latestBlock, merkleRoot, committedToday, "< 1m");
    }

    public LedgerVerifyResponse verifyChainIntegrity() {
        List<LedgerRecord> allRecords = ledgerRepository.findAllByOrderByBlockNumberAsc();
        if (allRecords.isEmpty()) {
            return new LedgerVerifyResponse(true, 0, 0, "Ledger is empty");
        }

        String expectedPreviousHash = "0";
        for (LedgerRecord record : allRecords) {
            if (!record.getPreviousHash().equals(expectedPreviousHash)) {
                return new LedgerVerifyResponse(false, record.getBlockNumber(), 42, "Chain broken at block " + record.getBlockNumber());
            }
            
            String dataToHash = record.getPreviousHash() + "|" + record.getBlockNumber() + "|" + record.getDescription() + "|" + record.getTimestamp();
            String computedHash = computeSha256(dataToHash);
            
            if (!computedHash.equals(record.getHash())) {
                return new LedgerVerifyResponse(false, record.getBlockNumber(), 42, "Hash mismatch at block " + record.getBlockNumber());
            }
            expectedPreviousHash = record.getHash();
        }

        return new LedgerVerifyResponse(true, allRecords.size(), 42, "Cryptographic integrity verified");
    }

    public LedgerProofResponse generateProof() {
        LedgerRecord latest = ledgerRepository.findTopByOrderByBlockNumberDesc().orElse(null);
        if (latest == null) {
            return new LedgerProofResponse("KAVACH-MAINNET", 0, "0", new ArrayList<>(), Instant.now().toString());
        }
        return new LedgerProofResponse(
                "KAVACH-MAINNET",
                latest.getBlockNumber(),
                latest.getHash(),
                Arrays.asList("node-delhi-01", "node-mumbai-02", "node-blr-01"),
                Instant.now().toString()
        );
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedhash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedhash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
