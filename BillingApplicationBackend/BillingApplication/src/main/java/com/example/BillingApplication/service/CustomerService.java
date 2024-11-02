package com.example.BillingApplication.service;

import com.example.BillingApplication.model.Customer;
import com.example.BillingApplication.model.User;
import com.example.BillingApplication.repository.CustomerRepository;
import com.example.BillingApplication.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;

    public Long generateUniqueCustomerId() {
        Long newId;
        do {
            newId = generateRandomId();
        } while (customerRepository.existsById(newId)); // Check for uniqueness
        return newId;
    }

    private Long generateRandomId() {
        Random random = new Random();
        return (long) (100000 + random.nextInt(900000)); // Generate a number between 100000 and 999999
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer addCustomer(Customer customer) {
        // Create the user first to generate the ID
        User user = new User();
        user.setUsername(customer.getName()); // Set other user details as necessary
        user.setPassword("your-default-password"); // Handle password appropriately
        user.setEmail(customer.getEmail());
        user.setMobileNumber(customer.getMobileNumber());
        user.setRole("CUSTOMER"); // Set the appropriate role
        userRepository.save(user); // Save the user to generate the ID

        // Set the same ID to the Customer
        customer.setId(user.getId()); // Set the same ID
        return customerRepository.save(customer); // Save the customer
    }



    @Transactional
    public Customer updateCustomerProfile(Long id, Customer updatedCustomer) {
        // Retrieve existing customer
        Customer existingCustomer = getCustomerById(id);

        // Log the updated customer details
        System.out.println("Updating customer with ID: " + id);
        System.out.println("Updated customer details: " + updatedCustomer);

        // Update the customer details
        existingCustomer.setName(updatedCustomer.getName());
        existingCustomer.setEmail(updatedCustomer.getEmail());

        // Update mobile number only if provided
        if (updatedCustomer.getMobileNumber() != null && !updatedCustomer.getMobileNumber().isEmpty()) {
            existingCustomer.setMobileNumber(updatedCustomer.getMobileNumber());
        }

        // Update the corresponding user details
        Optional<User> userOptional = userRepository.findById(existingCustomer.getId());
        if (userOptional.isPresent()) {
            User existingUser = userOptional.get();
            existingUser.setUsername(updatedCustomer.getName());
            existingUser.setEmail(updatedCustomer.getEmail());

            // Update mobile number in user details if provided
            if (updatedCustomer.getMobileNumber() != null && !updatedCustomer.getMobileNumber().isEmpty()) {
                existingUser.setMobileNumber(updatedCustomer.getMobileNumber());
            }

            // Check if a new password is provided
            if (updatedCustomer.getPassword() != null && !updatedCustomer.getPassword().isEmpty()) {
                String hashedPassword = hashPassword(updatedCustomer.getPassword());
                existingUser.setPassword(hashedPassword);
            }

            // Save the updated user
            userRepository.save(existingUser);
        } else {
            throw new EntityNotFoundException("User not found for customer ID: " + id);
        }

        // Save the updated customer
        return customerRepository.save(existingCustomer);
    }



    private String hashPassword(String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(password);
    }


    public void deleteCustomer(Long id) {
        // Fetch the customer to be deleted
        if (!customerRepository.existsById(id)) {
            throw new EntityNotFoundException("Customer not found with id: " + id);
        }

        // Check if the associated user exists before attempting to delete
        if (userRepository.existsById(id)&&customerRepository.existsById(id)) {
            userRepository.deleteById(id);
            customerRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("User not found with id: "+id);
        }

        // Now delete the customer

    }




    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
    }

    public Customer updateCustomer(Long id, Customer customer) {
        Customer existingCustomer = getCustomerById(id);
        existingCustomer.setName(customer.getName());
        existingCustomer.setEmail(customer.getEmail());
        existingCustomer.setMobileNumber(customer.getMobileNumber());
        return customerRepository.save(existingCustomer);
    }

    public Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }
}