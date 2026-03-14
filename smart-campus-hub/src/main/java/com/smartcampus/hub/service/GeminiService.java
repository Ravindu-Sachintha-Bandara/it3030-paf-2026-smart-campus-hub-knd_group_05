package com.smartcampus.hub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.hub.entity.Ticket;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // The API key should be stored securely in application.yml or environment vars.
    @Value("${gemini.api.key:YOUR_MOCK_API_KEY}")
    private String apiKey;

    // Google's Gemini Pro endpoint URL structure
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=";

    public Ticket.TicketCategory categorizeTicketDescription(String title, String description) {
        String prompt = buildPrompt(title, description);

        try {
            // 1. Prepare Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. Prepare Payload for Gemini formatting
            Map<String, Object> requestBody = new HashMap<>();

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("text", prompt);

            Map<String, Object> contentsMap = new HashMap<>();
            contentsMap.put("parts", List.of(partsMap));

            requestBody.put("contents", List.of(contentsMap));

            // Force Gemini to respond as explicitly as possible (no markdown fences, just
            // the word logic)
            // Note: Modern implementations use System Instructions or 'response_mime_type'
            // for strict enums

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // 3. Make REST Call
            ResponseEntity<String> response = restTemplate.postForEntity(
                    GEMINI_API_URL + apiKey,
                    request,
                    String.class);

            // 4. Parse the AI Response Payload
            JsonNode root = objectMapper.readTree(response.getBody());
            // Gemini typically wraps output in candidates[0].content.parts[0].text
            JsonNode textNode = root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text");

            String aiResponse = textNode.asText().trim().toUpperCase();

            // 5. Safely map string back to the backend Enum
            return parseCategorySafe(aiResponse);

        } catch (Exception e) {
            logger.error("Failed to categorize ticket with Gemini API. Defaulting to OTHER.", e);
            return Ticket.TicketCategory.OTHER;
        }
    }

    private String buildPrompt(String title, String description) {
        return """
                You are an AI assistant for a University Campus Operations system.
                Your task is to analyze the following maintenance ticket and classify it into EXACTLY ONE of these specific categories:

                [HARDWARE, SOFTWARE, NETWORK, PLUMBING, ELECTRICAL, FURNITURE, HVAC, OTHER]

                Title: "%s"
                Description: "%s"

                Rule: Respond ONLY with the raw category name exactly as written above. DO NOT provide markdown padding, explanations, or periods.
                """
                .formatted(title, description);
    }

    private Ticket.TicketCategory parseCategorySafe(String aiResponse) {
        // Strip markdown fences just in case Gemini ignored the prompt prompt
        // instructions
        String cleaned = aiResponse.replaceAll("`", "").trim();

        try {
            return Ticket.TicketCategory.valueOf(cleaned);
        } catch (IllegalArgumentException e) {
            logger.warn("Gemini returned invalid category enum: {}. Defaulting.", cleaned);
            return Ticket.TicketCategory.OTHER;
        }
    }
}
