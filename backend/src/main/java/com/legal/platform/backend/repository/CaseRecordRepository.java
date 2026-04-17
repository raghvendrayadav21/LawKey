package com.legal.platform.backend.repository;

import com.legal.platform.backend.model.CaseRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CaseRecordRepository extends MongoRepository<CaseRecord, String> {
    List<CaseRecord> findByCrimeTypeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String crimeType, String description);
}
