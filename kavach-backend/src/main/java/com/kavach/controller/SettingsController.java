package com.kavach.controller;

import com.kavach.model.SystemSettings;
import com.kavach.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    @GetMapping
    public ResponseEntity<SystemSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings request) {
        return ResponseEntity.ok(settingsService.updateSettings(request, "analyst.lead@defense.internal"));
    }
}
