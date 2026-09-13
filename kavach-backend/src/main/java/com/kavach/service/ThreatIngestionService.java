package com.kavach.service;

import com.kavach.dto.CisaKevResponse;
import com.kavach.dto.VulnerabilityDto;
import com.kavach.model.Advisory;
import com.kavach.repository.AdvisoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;

@Service
public class ThreatIngestionService {

    private static final String CISA_KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AdvisoryRepository advisoryRepository;

    @Autowired
    private LedgerService ledgerService;

    // Run every 12 hours (43200000 ms) and run once on startup
    @Scheduled(fixedDelay = 43200000, initialDelay = 10000)
    public void syncCisaKev() {
        System.out.println("Starting CISA KEV synchronization...");
        try {
            CisaKevResponse response = restTemplate.getForObject(CISA_KEV_URL, CisaKevResponse.class);
            if (response != null && response.getVulnerabilities() != null) {
                List<VulnerabilityDto> vulns = response.getVulnerabilities();
                System.out.println("Fetched " + vulns.size() + " vulnerabilities from CISA KEV.");
                
                int added = 0;
                // Just take the latest 50 to avoid overloading the DB during demo
                for (int i = 0; i < Math.min(vulns.size(), 50); i++) {
                    VulnerabilityDto dto = vulns.get(i);
                    // Check if exists
                    if (advisoryRepository.findByCve(dto.getCveID()).isEmpty()) {
                        Advisory adv = new Advisory();
                        adv.setCve(dto.getCveID());
                        adv.setTitle(dto.getVulnerabilityName());
                        adv.setConfidenceScore(dto.getKnownRansomwareCampaignUse() != null && dto.getKnownRansomwareCampaignUse().equals("Known") ? 99.0 : 85.0);
                        adv.setSource("CISA KEV");
                        adv.setTimestamp(Instant.now());
                        adv.setStatus("Pending");
                        adv.setDescription(dto.getShortDescription());
                        advisoryRepository.save(adv);
                        
                        ledgerService.commitRecord(
                            "Ingested CISA Advisory: " + adv.getCve(),
                            "Source: CISA KEV",
                            "System",
                            "Threat Intelligence",
                            "download",
                            "api"
                        );
                        added++;
                    }
                }
                System.out.println("Successfully added " + added + " new CISA KEV advisories.");
            }
        } catch (Exception e) {
            System.err.println("Failed to sync CISA KEV: " + e.getMessage());
        }
    }
}
