package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdAndUserTypeOrderByCreatedAtDesc(String userId, String userType);
    long countByUserIdAndUserTypeAndIsRead(String userId, String userType, boolean isRead);
}
