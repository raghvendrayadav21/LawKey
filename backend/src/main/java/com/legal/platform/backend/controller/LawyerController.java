package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.repository.LawyerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/lawyers")
public class LawyerController {

    @Autowired
    LawyerRepository lawyerRepository;

    @GetMapping
    public ResponseEntity<List<Lawyer>> getAllLawyers(
            @RequestParam(required = false) String specialization) {
        if (specialization != null && !specialization.isEmpty()) {
            return ResponseEntity.ok(
                    lawyerRepository.findBySpecializationContainingIgnoreCase(specialization));
        }
        return ResponseEntity.ok(lawyerRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lawyer> getLawyerById(@PathVariable String id) {
        return lawyerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLawyer(@PathVariable String id) {
        if (!lawyerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        lawyerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lawyer> updateLawyer(@PathVariable String id, @RequestBody Lawyer updatedLawyer) {
        return lawyerRepository.findById(id).map(existingLawyer -> {
            if (updatedLawyer.getName() != null) existingLawyer.setName(updatedLawyer.getName());
            if (updatedLawyer.getSpecialization() != null) existingLawyer.setSpecialization(updatedLawyer.getSpecialization());
            if (updatedLawyer.getExperience() != null) existingLawyer.setExperience(updatedLawyer.getExperience());
            if (updatedLawyer.getLocation() != null) existingLawyer.setLocation(updatedLawyer.getLocation());
            if (updatedLawyer.getFees() != null) existingLawyer.setFees(updatedLawyer.getFees());
            
            Lawyer savedLawyer = lawyerRepository.save(existingLawyer);
            return ResponseEntity.ok(savedLawyer);
        }).orElse(ResponseEntity.notFound().build());
    }
}
