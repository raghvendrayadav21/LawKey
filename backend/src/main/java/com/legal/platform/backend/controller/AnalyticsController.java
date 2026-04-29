package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Deal;
import com.legal.platform.backend.model.DealStatus;
import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.payload.response.AnalyticsResponse;
import com.legal.platform.backend.repository.DealRepository;
import com.legal.platform.backend.repository.LawyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired DealRepository dealRepository;
    @Autowired LawyerRepository lawyerRepository;

    @GetMapping("/lawyer")
    public ResponseEntity<?> getLawyerAnalytics() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        Lawyer lawyer = lawyerRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Lawyer not found"));

        List<Deal> allDeals = dealRepository.findByLawyerId(lawyer.getId());

        AnalyticsResponse response = new AnalyticsResponse();

        response.setTotalDeals(allDeals.size());
        response.setPendingDeals(allDeals.stream().filter(d -> d.getDealStatus() == DealStatus.PENDING).count());
        response.setAcceptedDeals(allDeals.stream().filter(d -> d.getDealStatus() == DealStatus.ACCEPTED).count());
        response.setCompletedDeals(allDeals.stream().filter(d -> d.getDealStatus() == DealStatus.COMPLETED).count());
        response.setRejectedDeals(allDeals.stream().filter(d -> d.getDealStatus() == DealStatus.REJECTED).count());

        // Total earnings from completed deals
        double totalEarnings = allDeals.stream()
                .filter(d -> d.getDealStatus() == DealStatus.COMPLETED)
                .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0.0)
                .sum();
        response.setTotalEarnings(totalEarnings);

        // Monthly earnings (last 6 months) — key: "MMM yyyy", value: earnings
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        Map<String, Double> monthlyEarnings = new LinkedHashMap<>();

        // Initialize last 6 months with 0
        Calendar cal = Calendar.getInstance();
        for (int i = 5; i >= 0; i--) {
            Calendar c = (Calendar) cal.clone();
            c.add(Calendar.MONTH, -i);
            String key = c.getTime().toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate().format(monthFmt);
            monthlyEarnings.put(key, 0.0);
        }

        allDeals.stream()
                .filter(d -> d.getDealStatus() == DealStatus.COMPLETED && d.getCreatedAt() != null)
                .forEach(d -> {
                    String monthKey = d.getCreatedAt().format(monthFmt);
                    if (monthlyEarnings.containsKey(monthKey)) {
                        monthlyEarnings.merge(monthKey, d.getAmount() != null ? d.getAmount() : 0.0, Double::sum);
                    }
                });
        response.setMonthlyEarnings(monthlyEarnings);

        // Win rate: completed / (completed + rejected) * 100
        long completed = response.getCompletedDeals();
        long rejected = response.getRejectedDeals();
        double winRate = (completed + rejected) > 0 ? (completed * 100.0) / (completed + rejected) : 0.0;
        response.setWinRate(Math.round(winRate * 10.0) / 10.0);

        response.setAverageRating(lawyer.getAverageRating() != null ? lawyer.getAverageRating() : 0.0);
        response.setTotalReviews(lawyer.getTotalReviews() != null ? lawyer.getTotalReviews() : 0);

        return ResponseEntity.ok(response);
    }
}
