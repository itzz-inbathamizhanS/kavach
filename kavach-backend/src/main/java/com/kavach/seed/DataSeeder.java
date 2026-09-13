package com.kavach.seed;

import com.kavach.model.*;
import com.kavach.repository.*;
import com.kavach.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdvisoryRepository advisoryRepository;

    @Autowired
    private IndicatorRepository indicatorRepository;

    @Autowired
    private EnforcementRepository enforcementRepository;

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private LedgerService ledgerService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedUsers();
            seedAdvisories();
            seedIndicators();
            seedEnforcement();
            seedApprovals();
            seedSettings();
            
            // Note: Ledger records are seeded automatically when some of the above are created
            // if we had used the services. But we saved via repositories. Let's seed initial ledger.
            seedInitialLedger();
            
            System.out.println("✅ KAVACH demo data seeded successfully.");
        }
    }

    private void seedUsers() {
        User user = new User();
        user.setEmail("analyst.lead@defense.internal");
        String adminPassword = System.getenv("ADMIN_PASSWORD") != null ? System.getenv("ADMIN_PASSWORD") : "changeme";
        user.setPasswordHash(passwordEncoder.encode(adminPassword));
        user.setDisplayName("Analyst Lead");
        user.setRole("ADMIN");
        user.setCreatedAt(Instant.now());
        userRepository.save(user);
    }

    private void seedAdvisories() {
        Advisory a1 = new Advisory();
        a1.setSource("CERT-In");
        a1.setTitle("Critical Vulnerability in Core Router Firmware");
        a1.setCve("CVE-2025-0104");
        a1.setDescription("Remote code execution via malformed ICMP packets.");
        a1.setTimestamp(Instant.now().minus(2, ChronoUnit.HOURS));
        a1.setStatus("Pending");
        a1.setConfidenceScore(95.0);
        
        Advisory a2 = new Advisory();
        a2.setSource("CISA KEV");
        a2.setTitle("Exploitation of Secure Gateway Appliances");
        a2.setCve("CVE-2025-0089");
        a2.setDescription("Active exploitation observed in the wild.");
        a2.setTimestamp(Instant.now().minus(5, ChronoUnit.HOURS));
        a2.setStatus("Verified");
        a2.setConfidenceScore(100.0);
        
        advisoryRepository.saveAll(Arrays.asList(a1, a2));
    }

    private void seedIndicators() {
        Indicator i1 = new Indicator();
        i1.setType("IP address");
        i1.setValue("45.33.22.11");
        i1.setSource("CERT-In");
        i1.setConfidenceScore(98.5);
        i1.setStatus("Enforced");
        i1.setCreatedAt(Instant.now().minus(1, ChronoUnit.HOURS));
        
        Indicator i2 = new Indicator();
        i2.setType("Domain");
        i2.setValue("malicious-c2.net");
        i2.setSource("Shadowserver");
        i2.setConfidenceScore(89.0);
        i2.setStatus("Needs review");
        i2.setCreatedAt(Instant.now().minus(3, ChronoUnit.HOURS));
        
        indicatorRepository.saveAll(Arrays.asList(i1, i2));
    }

    private void seedEnforcement() {
        EnforcementAction e1 = new EnforcementAction();
        e1.setIndicatorValue("45.33.22.11");
        e1.setTier("Tier 1 gateway");
        e1.setActionTaken("BGP Null Route");
        e1.setStatus("Enforced");
        e1.setTimestamp(Instant.now().minus(30, ChronoUnit.MINUTES));
        
        Evidence ev1 = new Evidence("Auto-Defense Matrix", "C-01: High Confidence IP Block", "Indefinite", "8f3a...90bc");
        e1.setEvidence(ev1);
        
        enforcementRepository.save(e1);
    }

    private void seedApprovals() {
        ApprovalRequest r1 = new ApprovalRequest();
        r1.setIndicatorValue("internal-db-node-03");
        r1.setType("Workload Quarantine");
        r1.setThreat("Lateral Movement Behavior");
        r1.setConfidenceScore(74.5);
        r1.setRequestedBy("AI Analytics Engine");
        r1.setRequestedAt(Instant.now().minus(15, ChronoUnit.MINUTES));
        r1.setStatus("PENDING");
        
        approvalRepository.save(r1);
    }

    private void seedInitialLedger() {
        ledgerService.commitRecord(
                "System initialized and genesis block created",
                "Global",
                "System",
                "Bootstrap",
                "settings",
                "policy"
        );
        ledgerService.commitRecord(
                "Automated enforcement action: BGP Null Route for 45.33.22.11",
                "Tier 1 gateway",
                "Auto-Defense Matrix",
                "Rule C-01",
                "bolt",
                "enforcement"
        );
    }

    private void seedSettings() {
        if (settingsRepository.count() == 0) {
            SystemSettings defaults = new SystemSettings();
            defaults.setConfidenceThreshold(85);
            
            Map<String, Boolean> feeds = new HashMap<>();
            feeds.put("certIn", true);
            feeds.put("honeynet", true);
            feeds.put("stix", false);
            defaults.setFeeds(feeds);
            
            Map<String, Boolean> policies = new HashMap<>();
            policies.put("dualAuth", true);
            policies.put("ledgerRepl", true);
            defaults.setPolicies(policies);
            
            defaults.setUpdatedAt(Instant.now());
            defaults.setUpdatedBy("System Initialization");
            
            settingsRepository.save(defaults);
        }
    }
}
