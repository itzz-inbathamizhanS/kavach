package com.kavach.service;

import com.kavach.model.SystemSettings;
import com.kavach.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private LedgerService ledgerService;

    public SystemSettings getSettings() {
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
            
            return settingsRepository.save(defaults);
        }
        
        return settingsRepository.findAll().get(0);
    }

    public SystemSettings updateSettings(SystemSettings request, String updatedBy) {
        SystemSettings settings = getSettings();
        
        if (request.getConfidenceThreshold() >= 50 && request.getConfidenceThreshold() <= 100) {
            settings.setConfidenceThreshold(request.getConfidenceThreshold());
        }
        if (request.getFeeds() != null) settings.setFeeds(request.getFeeds());
        if (request.getPolicies() != null) settings.setPolicies(request.getPolicies());
        
        settings.setUpdatedAt(Instant.now());
        settings.setUpdatedBy(updatedBy);
        
        SystemSettings saved = settingsRepository.save(settings);
        
        ledgerService.commitRecord(
                "System configuration updated",
                "Global Settings",
                updatedBy,
                "Administration",
                "settings",
                "policy"
        );
        
        return saved;
    }
}
