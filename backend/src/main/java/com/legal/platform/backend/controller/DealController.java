package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.payload.response.DealResponse;
import com.legal.platform.backend.payload.response.MessageResponse;
import com.legal.platform.backend.repository.ClientRepository;
import com.legal.platform.backend.repository.DealRepository;
import com.legal.platform.backend.repository.LawyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.legal.platform.backend.payload.request.ReviewRequest;
import com.legal.platform.backend.model.DealStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/deals")
public class DealController {

    @Autowired DealRepository dealRepository;
    @Autowired LawyerRepository lawyerRepository;
    @Autowired ClientRepository clientRepository;

    @PostMapping("/hire/{lawyerId}")
    public ResponseEntity<?> createDeal(@PathVariable String lawyerId, @RequestBody Deal newDeal) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<Client> optClient = clientRepository.findByUsername(userDetails.getUsername());
        if (!optClient.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Client not found"));
        }
        Client client = optClient.get();

        if (!lawyerRepository.existsById(lawyerId)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Lawyer not found"));
        }

        Deal deal = new Deal();
        deal.setClientId(client.getId());
        deal.setLawyerId(lawyerId);
        deal.setAmount(newDeal.getAmount());
        deal.setDescription(newDeal.getDescription());

        dealRepository.save(deal);
        return ResponseEntity.ok(new MessageResponse("Deal proposed successfully"));
    }

    @GetMapping("/client")
    public ResponseEntity<List<DealResponse>> getClientDeals() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Client client = clientRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<DealResponse> response = dealRepository.findByClientId(client.getId()).stream()
                .map(deal -> {
                    String lawyerName = lawyerRepository.findById(deal.getLawyerId())
                            .map(Lawyer::getName).orElse("Unknown Lawyer");
                    return new DealResponse(deal, client.getName(), lawyerName);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lawyer")
    public ResponseEntity<List<DealResponse>> getLawyerDeals() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Lawyer lawyer = lawyerRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        List<DealResponse> response = dealRepository.findByLawyerId(lawyer.getId()).stream()
                .map(deal -> {
                    String clientName = clientRepository.findById(deal.getClientId())
                            .map(Client::getName).orElse("Unknown Client");
                    return new DealResponse(deal, clientName, lawyer.getName());
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{dealId}/status")
    public ResponseEntity<?> updateDealStatus(@PathVariable String dealId, @RequestBody Deal updateReq) {
        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) return ResponseEntity.notFound().build();

        Deal deal = optDeal.get();
        if (updateReq.getDealStatus() != null) {
            deal.setDealStatus(updateReq.getDealStatus());
        }
        dealRepository.save(deal);
        return ResponseEntity.ok(new MessageResponse("Deal status updated"));
    }

    @PostMapping("/{dealId}/review")
    public ResponseEntity<?> submitReview(@PathVariable String dealId, @RequestBody ReviewRequest reviewReq) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Client client = clientRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) return ResponseEntity.notFound().build();
        Deal deal = optDeal.get();

        if (!deal.getClientId().equals(client.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Not authorized to review this deal"));
        }
        if (deal.getDealStatus() != DealStatus.COMPLETED) {
            return ResponseEntity.badRequest().body(new MessageResponse("Deal must be completed to leave a review"));
        }
        if (deal.getRating() != null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Review already submitted"));
        }

        deal.setRating(reviewReq.getRating());
        deal.setReview(reviewReq.getReview());
        dealRepository.save(deal);

        Lawyer lawyer = lawyerRepository.findById(deal.getLawyerId()).orElseThrow();
        int total = lawyer.getTotalReviews() == null ? 0 : lawyer.getTotalReviews();
        double avg = lawyer.getAverageRating() == null ? 0.0 : lawyer.getAverageRating();
        
        double newAvg = ((avg * total) + reviewReq.getRating()) / (total + 1);
        lawyer.setTotalReviews(total + 1);
        lawyer.setAverageRating(newAvg);
        lawyerRepository.save(lawyer);

        return ResponseEntity.ok(new MessageResponse("Review submitted successfully"));
    }

    @GetMapping(value = "/{dealId}/invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generateInvoice(@PathVariable String dealId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) return ResponseEntity.notFound().build();
        Deal deal = optDeal.get();
        
        if (deal.getDealStatus() != DealStatus.COMPLETED) {
            return ResponseEntity.badRequest().build();
        }

        Client client = clientRepository.findById(deal.getClientId()).orElseThrow();
        Lawyer lawyer = lawyerRepository.findById(deal.getLawyerId()).orElseThrow();

        // Verify authorization (must be either the client or the lawyer)
        if (!client.getUsername().equals(userDetails.getUsername()) && !lawyer.getUsername().equals(userDetails.getUsername())) {
            return ResponseEntity.status(403).build();
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            document.add(new Paragraph("INVOICE"));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("Deal ID: " + deal.getId()));
            document.add(new Paragraph("Date: " + deal.getCreatedAt().toString()));
            document.add(new Paragraph("Status: " + deal.getDealStatus().name()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Client Details:"));
            document.add(new Paragraph("Name: " + client.getName()));
            document.add(new Paragraph("Email: " + client.getEmail()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Lawyer Details:"));
            document.add(new Paragraph("Name: " + lawyer.getName()));
            document.add(new Paragraph("Specialization: " + lawyer.getSpecialization()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Services Rendered:"));
            document.add(new Paragraph(deal.getDescription() != null ? deal.getDescription() : "Legal Consultation"));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("--------------------------------------------------"));
            document.add(new Paragraph("TOTAL AMOUNT: INR " + deal.getAmount()));
            document.add(new Paragraph("--------------------------------------------------"));
            
            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=invoice_" + dealId + ".pdf");
            return ResponseEntity.ok().headers(headers).body(baos.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
