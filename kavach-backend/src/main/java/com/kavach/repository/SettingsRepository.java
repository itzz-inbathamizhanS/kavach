package com.kavach.repository;

import com.kavach.model.SystemSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettingsRepository extends MongoRepository<SystemSettings, String> {
}
