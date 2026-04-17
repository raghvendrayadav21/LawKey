package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ClientRepository extends MongoRepository<Client, String> {
    Optional<Client> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
