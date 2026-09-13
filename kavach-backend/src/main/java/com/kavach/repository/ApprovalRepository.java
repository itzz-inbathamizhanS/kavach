package com.kavach.repository;

import com.kavach.model.ApprovalRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends MongoRepository<ApprovalRequest, String> {
    List<ApprovalRequest> findByStatusOrderByRequestedAtDesc(String status);
    long countByStatus(String status);
}
