package com.legal.platform.backend.service;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.Lawyer;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

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
    }
}
