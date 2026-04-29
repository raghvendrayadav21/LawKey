package com.legal.platform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "vault_documents")
public class VaultDocument {
    
    @Id
    private String id;
    private String dealId;
    private String uploadedByType; // "CLIENT" or "LAWYER"
    private String uploadedById;
    private String fileName;
    private String fileType; // e.g., "PDF", "DOCX", "IMAGE"
    private String notes;
    private LocalDateTime uploadedAt;

    public VaultDocument() {
        this.uploadedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDealId() { return dealId; }
    public void setDealId(String dealId) { this.dealId = dealId; }

    public String getUploadedByType() { return uploadedByType; }
    public void setUploadedByType(String uploadedByType) { this.uploadedByType = uploadedByType; }

    public String getUploadedById() { return uploadedById; }
    public void setUploadedById(String uploadedById) { this.uploadedById = uploadedById; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
