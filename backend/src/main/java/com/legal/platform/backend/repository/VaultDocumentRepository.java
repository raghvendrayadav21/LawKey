package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.VaultDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VaultDocumentRepository extends MongoRepository<VaultDocument, String> {
    List<VaultDocument> findByDealIdOrderByUploadedAtDesc(String dealId);
}
