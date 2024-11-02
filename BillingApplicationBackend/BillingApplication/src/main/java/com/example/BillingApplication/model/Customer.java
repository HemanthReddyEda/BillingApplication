package com.example.BillingApplication.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Collection;


@Entity
@Data
@Table(name = "customers")
public class Customer {
    @Id
    private Long id;

    private String name;

    private String email;

    @Column(name = "mobile_number")
    @JsonProperty("mobilenumber")
    private String mobileNumber;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // Prevents password from being serialized in responses
    private String password;

    // No need for explicit getters and setters since Lombok's @Data generates them
}
