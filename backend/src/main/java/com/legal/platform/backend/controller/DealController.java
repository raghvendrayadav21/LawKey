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

import com.legal.platform.backend.service.NotificationService;

import com.legal.platform.backend.payload.request.ReviewRequest;
import com.legal.platform.backend.model.DealStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/deals")
public class DealController {

    @Autowired DealRepository dealRepository;
    @Autowired LawyerRepository lawyerRepository;
    @Autowired ClientRepository clientRepository;
    @Autowired NotificationService notificationService;

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
        deal.setAppointmentDate(newDeal.getAppointmentDate());

        dealRepository.save(deal);
        
        Lawyer lawyer = lawyerRepository.findById(lawyerId).orElseThrow();
        notificationService.sendDealProposedEmail(client, lawyer, deal);

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

        Client client = clientRepository.findById(deal.getClientId()).orElseThrow();
        Lawyer lawyer = lawyerRepository.findById(deal.getLawyerId()).orElseThrow();
        notificationService.sendDealStatusUpdateEmail(client, lawyer, deal);

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

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, new Color(91, 74, 232)); // Primary color
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(100, 100, 100));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.BLACK);
            Font whiteBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);

            // Header - Logo / Brand Name
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{1f, 1f});

            PdfPCell brandCell = new PdfPCell();
            brandCell.setBorder(PdfPCell.NO_BORDER);
            Paragraph brandName = new Paragraph("⚖️ LawKey", titleFont);
            brandCell.addElement(brandName);
            Paragraph tagLine = new Paragraph("Premium Legal Consultation Platform", subtitleFont);
            brandCell.addElement(tagLine);
            headerTable.addCell(brandCell);

            PdfPCell invoiceTitleCell = new PdfPCell(new Paragraph("INVOICE", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY)));
            invoiceTitleCell.setBorder(PdfPCell.NO_BORDER);
            invoiceTitleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            headerTable.addCell(invoiceTitleCell);
            document.add(headerTable);
            
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Details Table
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[]{1f, 1f});

            // Client Info
            PdfPCell clientCell = new PdfPCell();
            clientCell.setBorder(PdfPCell.NO_BORDER);
            clientCell.addElement(new Paragraph("Billed To:", boldFont));
            clientCell.addElement(new Paragraph(client.getName(), normalFont));
            clientCell.addElement(new Paragraph(client.getEmail(), normalFont));
            detailsTable.addCell(clientCell);

            // Invoice Info
            PdfPCell infoCell = new PdfPCell();
            infoCell.setBorder(PdfPCell.NO_BORDER);
            infoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            infoCell.addElement(new Paragraph("Invoice No: #" + deal.getId().substring(Math.max(0, deal.getId().length() - 8)).toUpperCase(), boldFont));
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
            infoCell.addElement(new Paragraph("Date: " + deal.getCreatedAt().format(dtf), normalFont));
            infoCell.addElement(new Paragraph("Status: PAID (" + deal.getDealStatus().name() + ")", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(0, 200, 150))));
            detailsTable.addCell(infoCell);
            
            document.add(detailsTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            // Service Table
            PdfPTable serviceTable = new PdfPTable(2);
            serviceTable.setWidthPercentage(100);
            serviceTable.setWidths(new float[]{3f, 1f});

            // Table Headers
            PdfPCell th1 = new PdfPCell(new Phrase("Description of Service", whiteBold));
            th1.setBackgroundColor(new Color(91, 74, 232));
            th1.setPadding(8);
            serviceTable.addCell(th1);

            PdfPCell th2 = new PdfPCell(new Phrase("Amount", whiteBold));
            th2.setBackgroundColor(new Color(91, 74, 232));
            th2.setPadding(8);
            th2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            serviceTable.addCell(th2);

            // Table Content
            PdfPCell td1 = new PdfPCell();
            td1.setPadding(10);
            td1.addElement(new Paragraph("Legal Consultation & Services", boldFont));
            td1.addElement(new Paragraph("Provided by Adv. " + lawyer.getName() + " (" + lawyer.getSpecialization() + ")", normalFont));
            if (deal.getDescription() != null) {
                td1.addElement(new Paragraph("Case ref: " + deal.getDescription(), FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY)));
            }
            serviceTable.addCell(td1);

            PdfPCell td2 = new PdfPCell(new Phrase("INR " + deal.getAmount(), normalFont));
            td2.setPadding(10);
            td2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            serviceTable.addCell(td2);

            // Total Row
            PdfPCell totalLabel = new PdfPCell(new Phrase("Total Paid", boldFont));
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setPadding(8);
            totalLabel.setBackgroundColor(new Color(240, 240, 240));
            serviceTable.addCell(totalLabel);

            PdfPCell totalValue = new PdfPCell(new Phrase("INR " + deal.getAmount(), boldFont));
            totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalValue.setPadding(8);
            totalValue.setBackgroundColor(new Color(240, 240, 240));
            serviceTable.addCell(totalValue);

            document.add(serviceTable);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            
            Paragraph footer = new Paragraph("Thank you for using LawKey platform for your legal needs.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);
            
            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=LawKey_Invoice_" + dealId.substring(Math.max(0, dealId.length() - 8)) + ".pdf");
            return ResponseEntity.ok().headers(headers).body(baos.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
