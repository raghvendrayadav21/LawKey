package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.Lawyer;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface LawyerRepository extends MongoRepository<Lawyer, String> {
    Optional<Lawyer> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    List<Lawyer> findBySpecializationContainingIgnoreCase(String specialization);
}
