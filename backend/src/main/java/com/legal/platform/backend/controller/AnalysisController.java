package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.CaseRecord;
import com.legal.platform.backend.payload.request.AnalysisRequest;
import com.legal.platform.backend.payload.response.AnalysisResponse;
import com.legal.platform.backend.repository.CaseRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private CaseRecordRepository caseRecordRepository;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.model:llama-3.1-8b-instant}")
    private String openaiModel;

    private static final String OPENAI_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/predict")
    @PreAuthorize("hasRole('LAWYER')")
    public ResponseEntity<?> predictCase(@RequestBody AnalysisRequest request) {
        String query = request.getQuery();
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Query cannot be empty.");
        }

        // 1. Fetch matching historical cases from MongoDB database
        List<CaseRecord> matches = caseRecordRepository.findByCrimeTypeContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
        if (matches.size() > 5) {
            matches = matches.subList(0, 5); // display only top 5 matches
        }

        // 2. Fetch AI Prediction from Groq (OpenAI interface)
        String aiPrediction = "AI Legal analysis is currently unavailable.";
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", openaiModel);
                
                List<Map<String, String>> messages = new ArrayList<>();
                // System Instruction Message
                Map<String, String> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are an expert AI Legal Assistant in India assisting a lawyer. The lawyer will provide details of a crime. Your job is to predict the likely IPC (Indian Penal Code) sections or related Indian Acts, and the possible legal punishments. Keep it concise, highly professional, and use bullet points.");
                
                // User Crime Query Message
                Map<String, String> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", "Crime analysis request: " + query);
                
                messages.add(sysMsg);
                messages.add(userMsg);
                requestBody.put("messages", messages);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, entity, Map.class);
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> msgEntry = (Map<String, Object>) choices.get(0).get("message");
                        aiPrediction = (String) msgEntry.get("content");
                    }
                }
            } catch (org.springframework.web.client.HttpStatusCodeException e) {
                System.err.println("Groq AI Error: " + e.getResponseBodyAsString());
                aiPrediction = "Error fetching AI prediction. The AI service returned an error.";
            } catch (Exception e) {
                e.printStackTrace();
                aiPrediction = "An unexpected error occurred while contacting AI service.";
            }
        }
        
        // 3. Construct and return response combining AI Text and Database Precedents
        AnalysisResponse resp = new AnalysisResponse(aiPrediction, matches);
        return ResponseEntity.ok(resp);
    }

    // Document Analyser - accessible to both CLIENT and LAWYER
    @PostMapping("/document")
    public ResponseEntity<?> analyzeDocument(@RequestBody Map<String, String> body) {
        String documentText = body.get("documentText");
        if (documentText == null || documentText.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Document text cannot be empty.");
            return ResponseEntity.badRequest().body(error);
        }

        // Truncate very long documents to avoid token limits
        if (documentText.length() > 5000) {
            documentText = documentText.substring(0, 5000) + "... [truncated]";
        }

        String aiSummary = "AI Document analysis is currently unavailable.";
        if (openaiApiKey != null && !openaiApiKey.trim().isEmpty()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openaiApiKey);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", openaiModel);

                List<Map<String, String>> messages = new ArrayList<>();

                Map<String, String> sysMsg = new HashMap<>();
                sysMsg.put("role", "system");
                sysMsg.put("content", "You are an expert AI Legal Document Analyst. The user will provide a legal document text (contract, agreement, FIR, court order, etc.). Your job is to:\n" +
                    "1. **Summary**: Provide a concise summary of the document in 3-5 bullet points.\n" +
                    "2. **Key Clauses / Important Points**: Highlight any critical clauses, deadlines, or obligations.\n" +
                    "3. **Potential Risks**: Identify any risks, ambiguous terms, or red flags.\n" +
                    "4. **Recommendations**: Suggest next steps or things to watch out for.\n" +
                    "Keep it professional and well-formatted with headings and bullet points.");

                Map<String, String> userMsg = new HashMap<>();
                userMsg.put("role", "user");
                userMsg.put("content", "Please analyze this legal document:\n\n" + documentText);

                messages.add(sysMsg);
                messages.add(userMsg);
                requestBody.put("messages", messages);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> msgEntry = (Map<String, Object>) choices.get(0).get("message");
                        aiSummary = (String) msgEntry.get("content");
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                aiSummary = "An error occurred while analyzing the document: " + e.getMessage();
            }
        }

        Map<String, String> result = new HashMap<>();
        result.put("summary", aiSummary);
        return ResponseEntity.ok(result);
    }
}
