package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    ClientRepository clientRepository;

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable String id) {
        if (!clientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        clientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable String id) {
        return clientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable String id, @RequestBody Client updatedClient) {
        return clientRepository.findById(id).map(existingClient -> {
            if (updatedClient.getName() != null) existingClient.setName(updatedClient.getName());
            
            Client savedClient = clientRepository.save(existingClient);
            return ResponseEntity.ok(savedClient);
        }).orElse(ResponseEntity.notFound().build());
    }
}
