package com.kavach.service;

import com.kavach.dto.ApprovalActionRequest;
import com.kavach.model.ApprovalRequest;
import com.kavach.model.EnforcementAction;
import com.kavach.model.Evidence;
import com.kavach.repository.ApprovalRepository;
import com.kavach.repository.EnforcementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ApprovalService {

    @Autowired
    private ApprovalRepository approvalRepository;

    @Autowired
    private EnforcementRepository enforcementRepository;

    @Autowired
    private LedgerService ledgerService;

    public List<ApprovalRequest> getPendingApprovals() {
        return approvalRepository.findByStatusOrderByRequestedAtDesc("PENDING");
    }

    public ApprovalRequest approve(String id, ApprovalActionRequest actionRequest, String resolvedBy) {
        ApprovalRequest request = approvalRepository.findById(id).orElseThrow();
        request.setStatus("APPROVED");
        request.setAnalystNotes(actionRequest.getAnalystNotes());
        request.setResolvedBy(resolvedBy);
        request.setResolvedAt(Instant.now());
        
        approvalRepository.save(request);

        // Create EnforcementAction
        EnforcementAction action = new EnforcementAction();
        action.setIndicatorValue(request.getIndicatorValue());
        action.setActionTaken(request.getType());
        action.setStatus("Enforced");
        action.setTimestamp(Instant.now());
        action.setTier("Manual Approval");
        
        Evidence evidence = new Evidence();
        evidence.setActor(resolvedBy);
        evidence.setRuleApplied("Approved via workflow");
        evidence.setChecksum("N/A");
        evidence.setDuration("Permanent");
        action.setEvidence(evidence);
        
        enforcementRepository.save(action);

        ledgerService.commitRecord(
                "Manual enforcement authorized: " + request.getIndicatorValue(),
                request.getType(),
                resolvedBy,
                "Security Operations",
                "gavel",
                "enforcement"
        );

        return request;
    }

    public ApprovalRequest reject(String id, ApprovalActionRequest actionRequest, String resolvedBy) {
        ApprovalRequest request = approvalRepository.findById(id).orElseThrow();
        request.setStatus("REJECTED");
        request.setAnalystNotes(actionRequest.getAnalystNotes());
        request.setResolvedBy(resolvedBy);
        request.setResolvedAt(Instant.now());
        
        approvalRepository.save(request);

        ledgerService.commitRecord(
                "Manual enforcement rejected: " + request.getIndicatorValue(),
                "No action taken",
                resolvedBy,
                "Security Operations",
                "block",
                "policy"
        );

        return request;
    }

    public void seedApprovals() {
        ApprovalRequest r1 = new ApprovalRequest();
        r1.setIndicatorValue("192.168.100.55");
        r1.setType("Network Segmentation");
        r1.setThreat("Unusual Data Exfiltration");
        r1.setConfidenceScore(78.5);
        r1.setRequestedBy("Anomaly Detection Service");
        r1.setRequestedAt(Instant.now().minus(10, java.time.temporal.ChronoUnit.MINUTES));
        r1.setStatus("PENDING");
        
        ApprovalRequest r2 = new ApprovalRequest();
        r2.setIndicatorValue("malware-download-site.com");
        r2.setType("DNS Sinkhole");
        r2.setThreat("Known Phishing Domain");
        r2.setConfidenceScore(82.0);
        r2.setRequestedBy("Threat Intel Feed");
        r2.setRequestedAt(Instant.now().minus(25, java.time.temporal.ChronoUnit.MINUTES));
        r2.setStatus("PENDING");
        
        approvalRepository.save(r1);
        approvalRepository.save(r2);
    }
}
