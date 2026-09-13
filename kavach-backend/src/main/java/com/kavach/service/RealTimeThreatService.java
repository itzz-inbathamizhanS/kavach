package com.kavach.service;

import com.kavach.model.ApprovalRequest;
import com.kavach.model.EnforcementAction;
import com.kavach.model.Evidence;
import com.kavach.model.Indicator;
import com.kavach.repository.ApprovalRepository;
import com.kavach.repository.EnforcementRepository;
import com.kavach.repository.IndicatorRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
public class RealTimeThreatService {

    private static final String EMERGING_THREATS_URL = "https://rules.emergingthreats.net/blockrules/compromised-ips.txt";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private IndicatorRepository indicatorRepository;

    @Autowired
    private EnforcementRepository enforcementRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private LedgerService ledgerService;

    private List<String> cachedIps = new ArrayList<>();
    private final Random random = new Random();

    @PostConstruct
    public void fetchThreats() {
        System.out.println("Fetching real-time threats from EmergingThreats...");
        try {
            String response = restTemplate.getForObject(EMERGING_THREATS_URL, String.class);
            if (response != null) {
                String[] lines = response.split("\n");
                for (String line : lines) {
                    String ip = line.trim();
                    if (!ip.isEmpty() && !ip.startsWith("#")) {
                        cachedIps.add(ip);
                    }
                }
                Collections.shuffle(cachedIps);
                System.out.println("Successfully cached " + cachedIps.size() + " compromised IPs.");
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch emerging threats: " + e.getMessage());
        }
    }
    // Arrays for generating variety
    private static final String[] ENFORCEMENT_ACTIONS = {"BGP Null Route", "DNS Sinkhole", "Firewall Drop (Edge)", "WAF Rule Enforced", "Proxy Block"};
    private static final String[] TIERS = {"Tier 1 gateway", "Core Router", "Cloud WAF", "Internal Switch"};
    private static final String[] APPROVAL_TYPES = {"Network Segmentation", "DNS Sinkhole", "Proxy Block", "Endpoint Isolation"};
    private static final String[] THREAT_TYPES = {"Command & Control Communication", "Data Exfiltration Attempt", "Ransomware Indicator", "Malicious Payload Download"};
    private static final String[] EVIDENCE_SOURCES = {"Auto-Defense Matrix", "Threat Intel Feed", "Behavioral Sandbox", "Heuristic Engine"};
    private static final String[] EVIDENCE_RULES = {"C-01: High Confidence Block", "A-99: Known Botnet", "X-42: Malware Signature Match", "R-05: Anomalous Traffic"};
    private static final String[] MALICIOUS_SITES = {"evil-phishing.com", "malware-download-site.net", "crypto-stealer.io", "fake-login-portal.org", "c2-server-hks.biz"};

    // Runs every 15 seconds
    @Scheduled(fixedRate = 15000, initialDelay = 10000)
    public void processNextThreat() {
        if (cachedIps.isEmpty()) {
            fetchThreats();
            if (cachedIps.isEmpty()) {
                return; // Still empty, API might be down
            }
        }

        // Generate a random confidence score between 70.0 and 100.0
        double confidence = 70.0 + (30.0 * random.nextDouble());
        confidence = Math.round(confidence * 10.0) / 10.0; // round to 1 decimal

        // Decide if this will be an IP or a Site/Domain (80% IP, 20% Site)
        boolean isSite = random.nextInt(100) < 20;
        
        String indicatorType;
        String indicatorValue;
        
        if (isSite) {
            indicatorType = "Domain";
            indicatorValue = MALICIOUS_SITES[random.nextInt(MALICIOUS_SITES.length)];
        } else {
            indicatorType = "IP address";
            indicatorValue = cachedIps.remove(0); // Get and remove a random IP
        }

        // Always create an Indicator
        Indicator indicator = new Indicator();
        indicator.setType(indicatorType);
        indicator.setValue(indicatorValue);
        indicator.setSource("EmergingThreats AI");
        indicator.setConfidenceScore(confidence);
        indicator.setCreatedAt(Instant.now());

        if (confidence >= 85.0) {
            // AUTOMATED ENFORCEMENT
            indicator.setStatus("Enforced");
            indicatorRepository.save(indicator);

            String actionTaken = ENFORCEMENT_ACTIONS[random.nextInt(ENFORCEMENT_ACTIONS.length)];
            String tier = TIERS[random.nextInt(TIERS.length)];
            String evSource = EVIDENCE_SOURCES[random.nextInt(EVIDENCE_SOURCES.length)];
            String evRule = EVIDENCE_RULES[random.nextInt(EVIDENCE_RULES.length)];

            EnforcementAction action = new EnforcementAction();
            action.setIndicatorValue(indicatorValue);
            action.setTier(tier);
            action.setActionTaken(actionTaken);
            action.setStatus("Enforced");
            action.setTimestamp(Instant.now());
            
            Evidence ev = new Evidence(evSource, evRule, "Indefinite", "b3a4...88cc");
            action.setEvidence(ev);
            enforcementRepository.save(action);

            ledgerService.commitRecord(
                    "Automated enforcement action: " + actionTaken + " for " + indicatorValue,
                    tier,
                    evSource,
                    evRule,
                    "bolt",
                    "enforcement"
            );
            System.out.println("Live Simulation: Auto-enforced " + indicatorType + " " + indicatorValue + " (Score: " + confidence + ")");
        } else {
            // MANUAL APPROVAL REQUIRED
            indicator.setStatus("Needs review");
            indicatorRepository.save(indicator);

            String approvalType = APPROVAL_TYPES[random.nextInt(APPROVAL_TYPES.length)];
            String threatType = THREAT_TYPES[random.nextInt(THREAT_TYPES.length)];

            ApprovalRequest req = new ApprovalRequest();
            req.setIndicatorValue(indicatorValue);
            req.setType(approvalType);
            req.setThreat(threatType);
            req.setConfidenceScore(confidence);
            req.setRequestedBy("AI Analytics Engine");
            req.setRequestedAt(Instant.now());
            req.setStatus("PENDING");
            approvalRepository.save(req);

            ledgerService.commitRecord(
                    "Suspicious activity detected: " + indicatorValue + ". Queued for review.",
                    "Global",
                    "AI Analytics Engine",
                    threatType,
                    "warning",
                    "api"
            );
            System.out.println("Live Simulation: Queued " + indicatorType + " " + indicatorValue + " for approval (Score: " + confidence + ")");
        }
    }
}
