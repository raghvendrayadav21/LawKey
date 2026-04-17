package com.legal.platform.backend.payload.response;

import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.DealStatus;
import java.time.LocalDateTime;

public class DealResponse {
    private String id;
    private String clientId;
    private String clientName;
    private String lawyerId;
    private String lawyerName;
    private DealStatus dealStatus;
    private Double amount;
    private String description;
    private LocalDateTime createdAt;

    public DealResponse(Deal deal, String clientName, String lawyerName) {
        this.id = deal.getId();
        this.clientId = deal.getClientId();
        this.clientName = clientName;
        this.lawyerId = deal.getLawyerId();
        this.lawyerName = lawyerName;
        this.dealStatus = deal.getDealStatus();
        this.amount = deal.getAmount();
        this.description = deal.getDescription();
        this.createdAt = deal.getCreatedAt();
    }

    public String getId() { return id; }
    public String getClientId() { return clientId; }
    public String getClientName() { return clientName; }
    public String getLawyerId() { return lawyerId; }
    public String getLawyerName() { return lawyerName; }
    public DealStatus getDealStatus() { return dealStatus; }
    public Double getAmount() { return amount; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
