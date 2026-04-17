package com.legal.platform.backend.config;

import com.legal.platform.backend.model.CaseRecord;
import com.legal.platform.backend.repository.CaseRecordRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initCaseRecords(CaseRecordRepository repo) {
        return args -> {
            // For development, we'll clear and re-seed so you always have the latest cases
            repo.deleteAll();
            
            repo.saveAll(List.of(
                // Financial Crimes
                new CaseRecord("Fraud", "Financial fraud of 5 lakh rupees through a fake investment scheme.", "IPC Section 420", "3 to 7 years imprisonment and fine", "Convicted", 2021),
                new CaseRecord("Check Bounce", "Failure to pay 10 lakh rupees resulting in a dishonored cheque.", "NI Act Section 138", "1 year imprisonment or double the cheque amount", "Pending", 2023),
                
                // Property & Theft
                new CaseRecord("Theft", "Stolen vehicle from a residential parking lot at night.", "IPC Section 379", "3 years imprisonment", "Convicted", 2023),
                new CaseRecord("Robbery", "Armed robbery at a convenience store at midnight.", "IPC Section 392", "7 years imprisonment", "Convicted", 2020),
                new CaseRecord("Burglary", "House-trespass and theft of valuable jewelry.", "IPC Section 445, 454", "5 years imprisonment", "Pending", 2024),
                
                // Assault & Violent Crimes
                new CaseRecord("Assault", "Physical altercation causing grievous hurt in a public place.", "IPC Section 325", "3 years imprisonment", "Acquitted due to lack of evidence", 2022),
                new CaseRecord("Murder", "Premeditated murder over property dispute.", "IPC Section 302", "Life imprisonment", "Convicted", 2018),
                new CaseRecord("Hit and run", "Reckless driving causing injury and fleeing the scene.", "IPC Section 279, 338", "2 years imprisonment", "Pending", 2024),
                
                // Civil & Family
                new CaseRecord("Defamation", "Publishing false statements online to harm reputation.", "IPC Section 499, 500", "2 years imprisonment or fine", "Settled out of court", 2019),
                new CaseRecord("Dowry Harassment", "Cruelty and demands for dowry by husband's family.", "IPC Section 498A", "3 years imprisonment and fine", "Convicted", 2021),
                new CaseRecord("Domestic Violence", "Physical and emotional abuse by spouse.", "PWDVA 2005", "Protection order and maintenance granted", "Closed", 2022),
                
                // Specialized Crimes
                new CaseRecord("Cybercrime", "Hacking into a company database and stealing data.", "IT Act Section 66", "3 years imprisonment and 5 lakh fine", "Convicted", 2020),
                new CaseRecord("Drug Possession", "Caught with 500 grams of contraband substance at airport.", "NDPS Act Section 20", "10 years imprisonment", "Pending", 2023),
                new CaseRecord("Medical Negligence", "Negligence resulting in patient injury during surgery.", "IPC Section 304A", "2 years imprisonment and heavy compensation", "Settled", 2021)
            ));
            System.out.println("Seeded database with 14 detailed dummy historical case records.");
        };
    }
}
