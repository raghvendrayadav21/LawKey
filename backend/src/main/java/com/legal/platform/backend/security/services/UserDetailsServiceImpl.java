package com.legal.platform.backend.security.services;

import com.legal.platform.backend.model.Lawyer;
import com.legal.platform.backend.model.Client;
import com.legal.platform.backend.repository.LawyerRepository;
import com.legal.platform.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    LawyerRepository lawyerRepository;

    @Autowired
    ClientRepository clientRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Search lawyers first
        Optional<Lawyer> lawyer = lawyerRepository.findByUsername(username);
        if (lawyer.isPresent()) {
            return UserDetailsImpl.buildFromLawyer(lawyer.get());
        }
        // Then search clients
        Optional<Client> client = clientRepository.findByUsername(username);
        if (client.isPresent()) {
            return UserDetailsImpl.buildFromClient(client.get());
        }
        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }
}
