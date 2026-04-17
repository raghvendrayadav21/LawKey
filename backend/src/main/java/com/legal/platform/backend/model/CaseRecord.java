package com.legal.platform.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "case_records")
public class CaseRecord {
    @Id
    private String id;
    private String crimeType;
    private String description;
    private String legalSection;
    private String punishment;
    private String courtDecision;
    private Integer year;

    public CaseRecord() {}

    public CaseRecord(String crimeType, String description, String legalSection, String punishment, String courtDecision, Integer year) {
        this.crimeType = crimeType;
        this.description = description;
        this.legalSection = legalSection;
        this.punishment = punishment;
        this.courtDecision = courtDecision;
        this.year = year;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCrimeType() { return crimeType; }
    public void setCrimeType(String crimeType) { this.crimeType = crimeType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLegalSection() { return legalSection; }
    public void setLegalSection(String legalSection) { this.legalSection = legalSection; }
    public String getPunishment() { return punishment; }
    public void setPunishment(String punishment) { this.punishment = punishment; }
    public String getCourtDecision() { return courtDecision; }
    public void setCourtDecision(String courtDecision) { this.courtDecision = courtDecision; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
