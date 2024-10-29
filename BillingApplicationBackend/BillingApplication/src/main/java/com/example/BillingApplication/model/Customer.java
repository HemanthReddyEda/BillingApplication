package com.example.BillingApplication.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;


@Entity
@Data
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    @Column(name = "mobile_number")
    @JsonProperty("mobilenumber")
    private String mobileNumber;

    // No need for explicit getters and setters since Lombok's @Data generates them
}
