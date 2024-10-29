package com.example.BillingApplication.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import jakarta.persistence.GenerationType;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password; // Make sure to store hashed passwords
    private String email;
    @Column(name = "mobile_number")
    @JsonProperty("mobilenumber")
    private String mobileNumber;
    private String role; // e.g., 'CUSTOMER', 'ADMIN'

    // Getters and Setters
}
