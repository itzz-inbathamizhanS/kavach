package com.kavach.service;

import com.kavach.dto.DashboardEvent;
import com.kavach.dto.DashboardStats;
import com.kavach.dto.PageResponse;
import com.kavach.model.Advisory;
import com.kavach.model.EnforcementAction;
import com.kavach.repository.AdvisoryRepository;
import com.kavach.repository.ApprovalRepository;
import com.kavach.repository.EnforcementRepository;
import com.kavach.repository.IndicatorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private AdvisoryRepository advisoryRepository;

    @Autowired
    private IndicatorRepository indicatorRepository;

    @Autowired
    private EnforcementRepository enforcementRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    public DashboardStats getStats() {
        Instant today = Instant.now().truncatedTo(ChronoUnit.DAYS);
        long advisoriesToday = advisoryRepository.countByTimestampAfter(today);
        long indicatorsVerified = indicatorRepository.countByStatus("Verified") + indicatorRepository.countByStatus("Enforced");
        long actionsEnforced = enforcementRepository.countByStatus("Enforced");
        long pendingApprovals = approvalRepository.countByStatus("PENDING");

        return new DashboardStats(advisoriesToday, indicatorsVerified, actionsEnforced, pendingApprovals);
    }

    public PageResponse<DashboardEvent> getEvents(String filter, int page, int size) {
        List<DashboardEvent> events = new ArrayList<>();
        
        // Fetch only enough records to satisfy the current page sort
        int fetchSize = (page + 1) * size;
        org.springframework.data.domain.PageRequest pageReq = org.springframework.data.domain.PageRequest.of(
            0, fetchSize, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "timestamp")
        );
        
        long totalElements = 0;
        
        if (filter.equals("all") || filter.equals("enforcement")) {
            totalElements += enforcementRepository.count();
            enforcementRepository.findAll(pageReq).forEach(a -> {
                String shortId = a.getId() != null && a.getId().length() >= 6 
                    ? a.getId().substring(a.getId().length() - 6) 
                    : a.getId();
                    
                events.add(new DashboardEvent(
                    a.getTimestamp().toString(),
                    "Enforcement Action: " + a.getActionTaken() + " on " + a.getIndicatorValue(),
                    shortId,
                    a.getTier(),
                    a.getStatus(),
                    "success",
                    "enforcement"
                ));
            });
        }
        
        if (filter.equals("all") || filter.equals("advisory")) {
            totalElements += advisoryRepository.count();
            advisoryRepository.findAll(pageReq).forEach(a -> 
                events.add(new DashboardEvent(
                    a.getTimestamp().toString(),
                    "New Threat Advisory: " + a.getTitle(),
                    a.getCve(),
                    "Global",
                    a.getStatus(),
                    "danger",
                    "advisory"
                ))
            );
        }
        
        // Sort the merged top N elements
        events.sort(Comparator.comparing(DashboardEvent::getTime).reversed());
        
        // Extract just the requested page
        int start = Math.min(page * size, events.size());
        int end = Math.min(start + size, events.size());
        List<DashboardEvent> paged = events.subList(start, end);
        
        int totalPages = (int) Math.ceil((double) totalElements / size);
        return new PageResponse<>(paged, page, size, totalElements, totalPages);
    }
}
