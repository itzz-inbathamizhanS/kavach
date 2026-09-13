package com.kavach.repository;

import com.kavach.model.LedgerRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface LedgerRepository extends MongoRepository<LedgerRecord, String> {

    Optional<LedgerRecord> findTopByOrderByBlockNumberDesc();

    List<LedgerRecord> findAllByOrderByBlockNumberAsc();

    @Query("{ '$and': [ " +
            "{ '$or': [ { 'category': { $regex: ?0, $options: 'i' } }, { '$expr': { $eq: [?0, 'all'] } } ] }, " +
            "{ '$or': [ { 'hash': { $regex: ?1, $options: 'i' } }, { 'description': { $regex: ?1, $options: 'i' } }, { 'actor': { $regex: ?1, $options: 'i' } } ] }" +
            "] }")
    Page<LedgerRecord> findByFilters(String category, String search, Pageable pageable);

    long countByTimestampAfter(Instant timestamp);
}
