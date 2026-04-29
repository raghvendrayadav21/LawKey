package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.model.Notification;
import com.legal.platform.backend.payload.response.MessageResponse;
import com.legal.platform.backend.repository.ClientRepository;
import com.legal.platform.backend.repository.LawyerRepository;
import com.legal.platform.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired NotificationRepository notificationRepository;
    @Autowired ClientRepository clientRepository;
    @Autowired LawyerRepository lawyerRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        // Check if client or lawyer
        Optional<Client> optClient = clientRepository.findByUsername(username);
        if (optClient.isPresent()) {
            String clientId = optClient.get().getId();
            List<Notification> notifications = notificationRepository
                    .findByUserIdAndUserTypeOrderByCreatedAtDesc(clientId, "CLIENT");
            return ResponseEntity.ok(notifications);
        }

        Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);
        if (optLawyer.isPresent()) {
            String lawyerId = optLawyer.get().getId();
            List<Notification> notifications = notificationRepository
                    .findByUserIdAndUserTypeOrderByCreatedAtDesc(lawyerId, "LAWYER");
            return ResponseEntity.ok(notifications);
        }

        return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Client> optClient = clientRepository.findByUsername(username);
        if (optClient.isPresent()) {
            long count = notificationRepository.countByUserIdAndUserTypeAndIsRead(
                    optClient.get().getId(), "CLIENT", false);
            return ResponseEntity.ok(count);
        }

        Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);
        if (optLawyer.isPresent()) {
            long count = notificationRepository.countByUserIdAndUserTypeAndIsRead(
                    optLawyer.get().getId(), "LAWYER", false);
            return ResponseEntity.ok(count);
        }

        return ResponseEntity.ok(0);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        if (!opt.isPresent()) return ResponseEntity.notFound().build();

        Notification notification = opt.get();
        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(new MessageResponse("Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Client> optClient = clientRepository.findByUsername(username);
        if (optClient.isPresent()) {
            List<Notification> notifications = notificationRepository
                    .findByUserIdAndUserTypeOrderByCreatedAtDesc(optClient.get().getId(), "CLIENT");
            notifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(notifications);
            return ResponseEntity.ok(new MessageResponse("All marked as read"));
        }

        Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);
        if (optLawyer.isPresent()) {
            List<Notification> notifications = notificationRepository
                    .findByUserIdAndUserTypeOrderByCreatedAtDesc(optLawyer.get().getId(), "LAWYER");
            notifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(notifications);
            return ResponseEntity.ok(new MessageResponse("All marked as read"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("User not found"));
    }
}
