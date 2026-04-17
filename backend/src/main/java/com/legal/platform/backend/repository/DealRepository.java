package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.Deal;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DealRepository extends MongoRepository<Deal, String> {
    List<Deal> findByClientId(String clientId);
    List<Deal> findByLawyerId(String lawyerId);
}
