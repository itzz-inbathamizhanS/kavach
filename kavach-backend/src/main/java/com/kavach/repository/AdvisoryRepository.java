package com.kavach.repository;

import com.kavach.model.Advisory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface AdvisoryRepository extends MongoRepository<Advisory, String> {

    @Query("{ '$and': [ " +
            "{ '$or': [ { 'source': { $regex: ?0, $options: 'i' } }, { '$expr': { $eq: [?0, 'all'] } } ] }, " +
            "{ '$or': [ { 'title': { $regex: ?1, $options: 'i' } }, { 'cve': { $regex: ?1, $options: 'i' } } ] }" +
            "] }")
    Page<Advisory> findByFilters(String source, String search, Pageable pageable);

    long countByTimestampAfter(Instant timestamp);
    long countByStatus(String status);
    
    java.util.Optional<Advisory> findByCve(String cve);
}
