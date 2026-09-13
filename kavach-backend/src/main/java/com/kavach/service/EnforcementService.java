package com.kavach.service;

import com.kavach.dto.EnforcementStatsDto;
import com.kavach.dto.PageResponse;
import com.kavach.model.EnforcementAction;
import com.kavach.repository.EnforcementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class EnforcementService {

    @Autowired
    private EnforcementRepository enforcementRepository;

    public PageResponse<EnforcementAction> getActions(String status, String search, int page, int size) {
        if (status == null || status.isEmpty()) status = "all";
        if (search == null) search = "";

        Page<EnforcementAction> p = enforcementRepository.findByFilters(
                status, search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
        return PageResponse.of(p);
    }

    public EnforcementStatsDto getStats() {
        long total = enforcementRepository.count();
        long activeTierBlocks = enforcementRepository.countByStatus("Enforced");
        long manualReviews = enforcementRepository.countByStatus("Needs review");
        long addedToday = enforcementRepository.countByTimestampAfter(Instant.now().truncatedTo(ChronoUnit.DAYS));
        
        return new EnforcementStatsDto(total, "98.2%", activeTierBlocks, manualReviews, addedToday);
    }
}
