package com.kavach.repository;

import com.kavach.model.Indicator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface IndicatorRepository extends MongoRepository<Indicator, String> {

    @Query("{ '$or': [ { 'value': { $regex: ?0, $options: 'i' } }, { 'source': { $regex: ?0, $options: 'i' } }, { 'type': { $regex: ?0, $options: 'i' } }, { 'status': { $regex: ?0, $options: 'i' } } ] }")
    Page<Indicator> searchIndicators(String search, Pageable pageable);

    long countByStatus(String status);
    long countByConfidenceScoreGreaterThanEqual(double score);
    long countByCreatedAtAfter(Instant timestamp);
}
