package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.*;
import com.legal.platform.backend.payload.response.MessageResponse;
import com.legal.platform.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/messages")
public class MessagingController {

    @Autowired MessageRepository messageRepository;
    @Autowired DealRepository dealRepository;
    @Autowired ClientRepository clientRepository;
    @Autowired LawyerRepository lawyerRepository;

    // Send a message in a deal chat
    @PostMapping("/{dealId}/send")
    public ResponseEntity<?> sendMessage(@PathVariable String dealId,
                                         @RequestBody Map<String, String> body) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        // Verify deal exists and is ACCEPTED
        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Deal not found"));
        }
        Deal deal = optDeal.get();
        if (deal.getDealStatus() != DealStatus.ACCEPTED) {
            return ResponseEntity.badRequest().body(new MessageResponse("Chat is only allowed for accepted deals"));
        }

        // Determine sender (client or lawyer)
        String senderId;
        String senderName;
        String senderRole;

        Optional<Client> optClient = clientRepository.findByUsername(username);
        Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);

        if (optClient.isPresent()) {
            Client client = optClient.get();
            senderId = client.getId();
            senderName = client.getName();
            senderRole = "CLIENT";
        } else if (optLawyer.isPresent()) {
            Lawyer lawyer = optLawyer.get();
            senderId = lawyer.getId();
            senderName = lawyer.getName();
            senderRole = "LAWYER";
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
        }

        String content = body.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Message cannot be empty"));
        }

        Message message = new Message();
        message.setDealId(dealId);
        message.setSenderId(senderId);
        message.setSenderName(senderName);
        message.setSenderRole(senderRole);
        message.setContent(content.trim());

        messageRepository.save(message);
        return ResponseEntity.ok(message);
    }

    // Get all messages for a deal
    @GetMapping("/{dealId}")
    public ResponseEntity<?> getMessages(@PathVariable String dealId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        // Verify deal exists
        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Deal not found"));
        }

        List<Message> messages = messageRepository.findByDealIdOrderByTimestampAsc(dealId);
        return ResponseEntity.ok(messages);
    }
}
