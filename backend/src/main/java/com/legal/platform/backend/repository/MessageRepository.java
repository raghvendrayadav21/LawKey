package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByDealIdOrderByTimestampAsc(String dealId);
}
