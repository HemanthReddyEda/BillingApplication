package com.example.BillingApplication.service;

import com.example.BillingApplication.model.Customer;
import com.example.BillingApplication.model.User;
import com.example.BillingApplication.repository.CustomerRepository;
import com.example.BillingApplication.repository.UserRepository;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(User user) {
        // Hash the password before saving
        user.setPassword(hashPassword(user.getPassword()));

        // Save user in users table
        User savedUser = userRepository.save(user);

        // Save customer in customers table if role is CUSTOMER
        if ("CUSTOMER".equalsIgnoreCase(user.getRole())) {
            Customer customer = new Customer();
            customer.setName(user.getUsername());
            customer.setEmail(user.getEmail());
            customer.setMobileNumber(user.getMobileNumber());
            // Set any other necessary fields for Customer if they exist
            customerRepository.save(customer);
        } else if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return savedUser; // Return the saved user object for ADMIN role
        } else {
            throw new IllegalArgumentException("Invalid role specified.");
        }

        return savedUser; // Return the saved user object
    }

    public User login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent() && verifyPassword(password, userOptional.get().getPassword())) {
            return userOptional.get(); // Return the logged-in user
        }
        throw new RuntimeException("Invalid username or password");
    }

    private String hashPassword(String password) {
        return passwordEncoder.encode(password); // Hash the password using BCrypt
    }

    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword); // Verify the password
    }
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }
}
