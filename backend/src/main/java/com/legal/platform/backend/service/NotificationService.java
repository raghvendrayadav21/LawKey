package com.legal.platform.backend.service;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.model.Notification;
import com.legal.platform.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendDealProposedEmail(Client client, Lawyer lawyer, Deal deal) {
        System.out.println("\n========== SIMULATED EMAIL ==========");
        System.out.println("To: " + lawyer.getEmail() + " (" + lawyer.getName() + ")");
        System.out.println("Subject: New Deal Proposal from " + client.getName());
        System.out.println("Body:");
        System.out.println("Dear Adv. " + lawyer.getName() + ",");
        System.out.println("You have received a new legal consultation request.");
        System.out.println("Client: " + client.getName());
        System.out.println("Offered Amount: INR " + deal.getAmount());
        if (deal.getAppointmentDate() != null) {
            System.out.println("Requested Appointment: " + deal.getAppointmentDate());
        }
        System.out.println("Please log in to your LawKey dashboard to accept or decline the deal.");
        System.out.println("=====================================\n");

        // Save in-app notification for Lawyer
        Notification notification = new Notification(
            lawyer.getId(),
            "LAWYER",
            "New deal proposal from " + client.getName() + " — ₹" + deal.getAmount(),
            "DEAL_PROPOSED",
            deal.getId()
        );
        notificationRepository.save(notification);
    }

    public void sendDealStatusUpdateEmail(Client client, Lawyer lawyer, Deal deal) {
        System.out.println("\n========== SIMULATED EMAIL ==========");
        System.out.println("To: " + client.getEmail() + " (" + client.getName() + ")");
        System.out.println("Subject: Update on your Legal Deal (Status: " + deal.getDealStatus() + ")");
        System.out.println("Body:");
        System.out.println("Dear " + client.getName() + ",");
        System.out.println("Adv. " + lawyer.getName() + " has updated the status of your deal.");
        System.out.println("New Status: " + deal.getDealStatus());
        if (deal.getDealStatus().name().equals("ACCEPTED")) {
            System.out.println("You can now open the chat and communicate with the lawyer.");
        } else if (deal.getDealStatus().name().equals("COMPLETED")) {
            System.out.println("The deal is marked as completed! You can now download your invoice and leave a review.");
        }
        System.out.println("Please log in to your LawKey dashboard for more details.");
        System.out.println("=====================================\n");

        // Save in-app notification for Client
        String statusMsg;
        switch (deal.getDealStatus().name()) {
            case "ACCEPTED": statusMsg = "Adv. " + lawyer.getName() + " accepted your deal proposal! You can now start chatting."; break;
            case "REJECTED": statusMsg = "Adv. " + lawyer.getName() + " declined your deal proposal."; break;
            case "COMPLETED": statusMsg = "Your case with Adv. " + lawyer.getName() + " is marked as completed. Download your invoice!"; break;
            default: statusMsg = "Deal status updated to " + deal.getDealStatus().name() + " by Adv. " + lawyer.getName();
        }

        Notification notification = new Notification(
            client.getId(),
            "CLIENT",
            statusMsg,
            "STATUS_UPDATE",
            deal.getId()
        );
        notificationRepository.save(notification);
    }
}
