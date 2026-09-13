package com.kavach.repository;

import com.kavach.model.EnforcementAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface EnforcementRepository extends MongoRepository<EnforcementAction, String> {

    @Query("{ '$and': [ " +
            "{ '$or': [ { 'status': { $regex: ?0, $options: 'i' } }, { '$expr': { $eq: [?0, 'all'] } } ] }, " +
            "{ '$or': [ { 'indicatorValue': { $regex: ?1, $options: 'i' } }, { 'actionTaken': { $regex: ?1, $options: 'i' } }, { 'tier': { $regex: ?1, $options: 'i' } } ] }" +
            "] }")
    Page<EnforcementAction> findByFilters(String status, String search, Pageable pageable);

    long countByStatus(String status);
    long countByTimestampAfter(Instant timestamp);
}
