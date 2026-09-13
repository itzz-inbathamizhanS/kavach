package com.kavach.service;

import com.kavach.dto.IndicatorStatsDto;
import com.kavach.dto.PageResponse;
import com.kavach.model.Indicator;
import com.kavach.repository.IndicatorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class IndicatorService {

    @Autowired
    private IndicatorRepository indicatorRepository;

    public PageResponse<Indicator> getIndicators(String search, int page, int size) {
        if (search == null) search = "";
        
        Page<Indicator> p = indicatorRepository.searchIndicators(
                search, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "confidenceScore")));
        return PageResponse.of(p);
    }

    public IndicatorStatsDto getStats() {
        long total = indicatorRepository.count();
        long highConfidence = indicatorRepository.countByConfidenceScoreGreaterThanEqual(90.0);
        long activeBlocks = indicatorRepository.countByStatus("Enforced");
        long addedToday = indicatorRepository.countByCreatedAtAfter(Instant.now().truncatedTo(ChronoUnit.DAYS));
        
        return new IndicatorStatsDto(total, highConfidence, activeBlocks, addedToday);
    }

    public byte[] exportCsv() {
        List<Indicator> indicators = indicatorRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("Type,Value,Source,Confidence,Status,Created At\n");
        
        for (Indicator ind : indicators) {
            sb.append(ind.getType()).append(",")
              .append(ind.getValue()).append(",")
              .append(ind.getSource()).append(",")
              .append(ind.getConfidenceScore()).append(",")
              .append(ind.getStatus()).append(",")
              .append(ind.getCreatedAt()).append("\n");
        }
        
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
