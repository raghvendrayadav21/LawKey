package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.model.VaultDocument;
import com.legal.platform.backend.payload.response.MessageResponse;
import com.legal.platform.backend.repository.ClientRepository;
import com.legal.platform.backend.repository.DealRepository;
import com.legal.platform.backend.repository.LawyerRepository;
import com.legal.platform.backend.repository.VaultDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/vault")
public class VaultController {

    @Autowired VaultDocumentRepository vaultDocumentRepository;
    @Autowired DealRepository dealRepository;
    @Autowired ClientRepository clientRepository;
    @Autowired LawyerRepository lawyerRepository;

    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDocuments(@PathVariable String dealId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) return ResponseEntity.notFound().build();
        Deal deal = optDeal.get();

        boolean authorized = false;
        Optional<Client> optClient = clientRepository.findByUsername(username);
        if (optClient.isPresent() && deal.getClientId().equals(optClient.get().getId())) {
            authorized = true;
        }

        Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);
        if (optLawyer.isPresent() && deal.getLawyerId().equals(optLawyer.get().getId())) {
            authorized = true;
        }

        if (!authorized) {
            return ResponseEntity.status(403).body(new MessageResponse("Unauthorized to view this deal's vault"));
        }

        List<VaultDocument> documents = vaultDocumentRepository.findByDealIdOrderByUploadedAtDesc(dealId);
        return ResponseEntity.ok(documents);
    }

    @PostMapping("/{dealId}")
    public ResponseEntity<?> addDocument(@PathVariable String dealId, @RequestBody VaultDocument docRequest) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String username = userDetails.getUsername();

        Optional<Deal> optDeal = dealRepository.findById(dealId);
        if (!optDeal.isPresent()) return ResponseEntity.notFound().build();
        Deal deal = optDeal.get();

        VaultDocument doc = new VaultDocument();
        doc.setDealId(dealId);
        doc.setFileName(docRequest.getFileName());
        doc.setFileType(docRequest.getFileType());
        doc.setNotes(docRequest.getNotes());

        Optional<Client> optClient = clientRepository.findByUsername(username);
        if (optClient.isPresent() && deal.getClientId().equals(optClient.get().getId())) {
            doc.setUploadedByType("CLIENT");
            doc.setUploadedById(optClient.get().getId());
        } else {
            Optional<Lawyer> optLawyer = lawyerRepository.findByUsername(username);
            if (optLawyer.isPresent() && deal.getLawyerId().equals(optLawyer.get().getId())) {
                doc.setUploadedByType("LAWYER");
                doc.setUploadedById(optLawyer.get().getId());
            } else {
                return ResponseEntity.status(403).body(new MessageResponse("Unauthorized to add to this deal's vault"));
            }
        }

        vaultDocumentRepository.save(doc);
        return ResponseEntity.ok(new MessageResponse("Document metadata added successfully"));
    }
}
