package com.legal.platform.backend.payload.response;

import com.legal.platform.backend.model.CaseRecord;
import java.util.List;

public class AnalysisResponse {
    private String aiPrediction;
    private List<CaseRecord> historicalCases;

    public AnalysisResponse(String aiPrediction, List<CaseRecord> historicalCases) {
        this.aiPrediction = aiPrediction;
        this.historicalCases = historicalCases;
    }

    public String getAiPrediction() { return aiPrediction; }
    public void setAiPrediction(String aiPrediction) { this.aiPrediction = aiPrediction; }
    public List<CaseRecord> getHistoricalCases() { return historicalCases; }
    public void setHistoricalCases(List<CaseRecord> historicalCases) { this.historicalCases = historicalCases; }
}
