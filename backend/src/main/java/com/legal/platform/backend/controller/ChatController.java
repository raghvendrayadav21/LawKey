package com.legal.platform.backend.controller;

import com.legal.platform.backend.payload.request.ChatRequest;
import com.legal.platform.backend.payload.response.ChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    private static final String OPENAI_URL = "https://api.groq.com/openai/v1/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest chatRequest) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            return ResponseEntity.ok(new ChatResponse("I am sorry, but the AI service is currently unavailable. (OpenAI API Key is missing on the server)"));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            
            List<Map<String, String>> messages = new ArrayList<>();
            // System prompt
            Map<String, String> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", "You are a helpful assistant for a Legal Lawyer Hiring Platform. Help users find lawyers, understand the platform, and answer basic legal questions. Keep responses concise and formatted clearly.");
            
            // User message
            Map<String, String> userMessage = new HashMap<>();
            userMessage.put("role", "user");
            userMessage.put("content", chatRequest.getMessage());
            
            messages.add(systemMessage);
            messages.add(userMessage);

            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENAI_URL, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> messageEntry = (Map<String, Object>) choices.get(0).get("message");
                    String reply = (String) messageEntry.get("content");
                    return ResponseEntity.ok(new ChatResponse(reply));
                }
            }
            
            return ResponseEntity.ok(new ChatResponse("Sorry, I could not process your request at this time."));
            
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("OpenAI API Error: " + e.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ChatResponse("AI Service Error: " + e.getStatusText()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ChatResponse("An unexpected error occurred: " + e.getMessage()));
        }
    }
}
