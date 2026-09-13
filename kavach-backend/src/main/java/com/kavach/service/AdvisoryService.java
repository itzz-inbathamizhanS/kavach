package com.kavach.service;

import com.kavach.dto.AdvisoryStatsDto;
import com.kavach.dto.PageResponse;
import com.kavach.model.Advisory;
import com.kavach.repository.AdvisoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AdvisoryService {

    @Autowired
    private AdvisoryRepository advisoryRepository;

    @Autowired
    private LedgerService ledgerService;

    public PageResponse<Advisory> getAdvisories(String source, String search, int page, int size) {
        if (source == null || source.isEmpty()) source = "all";
        if (search == null) search = "";
        
        Page<Advisory> p = advisoryRepository.findByFilters(
                source, search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
        return PageResponse.of(p);
    }

    public AdvisoryStatsDto getStats() {
        long total = advisoryRepository.count();
        long unreviewed = advisoryRepository.countByStatus("Pending");
        long critical = advisoryRepository.countByStatus("Verified"); // simplified metric
        
        return new AdvisoryStatsDto(total, unreviewed, "18m", critical);
    }

    public void markReviewed(List<String> ids) {
        List<Advisory> advisories = (List<Advisory>) advisoryRepository.findAllById(ids);
        for (Advisory adv : advisories) {
            adv.setStatus("Reviewed");
            advisoryRepository.save(adv);
            
            ledgerService.commitRecord(
                    "Advisory marked as reviewed: " + adv.getCve(),
                    "Source: " + adv.getSource(),
                    "Analyst",
                    "Security Operations",
                    "check_circle",
                    "policy"
            );
        }
    }

    public Advisory createAdvisory(Advisory advisory) {
        if (advisory.getTimestamp() == null) {
            advisory.setTimestamp(Instant.now());
        }
        if (advisory.getStatus() == null) {
            advisory.setStatus("Pending");
        }
        Advisory saved = advisoryRepository.save(advisory);
        
        ledgerService.commitRecord(
                "Manual Intel Ingested: " + saved.getCve(),
                "Source: " + saved.getSource(),
                "Analyst",
                "Threat Intelligence",
                "add_circle",
                "database"
        );
        return saved;
    }
}
