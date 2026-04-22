package com.legal.platform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "deals")
public class Deal {
    @Id
    private String id;
    private String clientId;
    private String lawyerId;
    private DealStatus dealStatus;
    private LocalDateTime createdAt;
    
    // Additional fields like amount, notes
    private Double amount;
    private String description;
    private String appointmentDate;

    // Review fields
    private Integer rating;
    private String review;

    public Deal() {
        this.createdAt = LocalDateTime.now();
        this.dealStatus = DealStatus.PENDING;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getLawyerId() { return lawyerId; }
    public void setLawyerId(String lawyerId) { this.lawyerId = lawyerId; }

    public DealStatus getDealStatus() { return dealStatus; }
    public void setDealStatus(DealStatus dealStatus) { this.dealStatus = dealStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getReview() { return review; }
    public void setReview(String review) { this.review = review; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }
}
