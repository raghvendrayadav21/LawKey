package com.legal.platform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;
    private String userType; // "CLIENT" or "LAWYER"
    private String message;
    private String type;     // "DEAL_PROPOSED", "STATUS_UPDATE", "REVIEW_RECEIVED"
    private boolean isRead;
    private LocalDateTime createdAt;
    private String dealId;

    public Notification() {
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String userId, String userType, String message, String type, String dealId) {
        this();
        this.userId = userId;
        this.userType = userType;
        this.message = message;
        this.type = type;
        this.dealId = dealId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getDealId() { return dealId; }
    public void setDealId(String dealId) { this.dealId = dealId; }
}
