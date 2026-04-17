package com.legal.platform.backend.controller;

import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.payload.request.LoginRequest;
import com.legal.platform.backend.payload.request.SignupRequest;
import com.legal.platform.backend.payload.response.JwtResponse;
import com.legal.platform.backend.payload.response.MessageResponse;
import com.legal.platform.backend.repository.LawyerRepository;
import com.legal.platform.backend.repository.ClientRepository;
import com.legal.platform.backend.security.jwt.JwtUtils;
import com.legal.platform.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    LawyerRepository lawyerRepository;

    @Autowired
    ClientRepository clientRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        String role = signUpRequest.getRole() == null ? "" : signUpRequest.getRole().toUpperCase();

        if ("LAWYER".equals(role)) {
            if (lawyerRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            if (lawyerRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            Lawyer lawyer = new Lawyer();
            lawyer.setUsername(signUpRequest.getUsername());
            lawyer.setEmail(signUpRequest.getEmail());
            lawyer.setName(signUpRequest.getName());
            lawyer.setPassword(encoder.encode(signUpRequest.getPassword()));
            lawyer.setSpecialization(signUpRequest.getSpecialization());
            lawyer.setExperience(signUpRequest.getExperience());
            lawyer.setLocation(signUpRequest.getLocation());
            lawyer.setFees(signUpRequest.getFees());
            lawyerRepository.save(lawyer);

        } else if ("CLIENT".equals(role)) {
            if (clientRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
            }
            if (clientRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
            }
            Client client = new Client();
            client.setUsername(signUpRequest.getUsername());
            client.setEmail(signUpRequest.getEmail());
            client.setName(signUpRequest.getName());
            client.setPassword(encoder.encode(signUpRequest.getPassword()));
            clientRepository.save(client);

        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role. Use LAWYER or CLIENT."));
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
