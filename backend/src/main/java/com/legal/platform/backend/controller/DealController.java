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
}
