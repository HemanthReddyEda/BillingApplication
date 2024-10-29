package com.example.BillingApplication.service;

import com.example.BillingApplication.model.Customer;
import com.example.BillingApplication.repository.CustomerRepository;
import org.apache.velocity.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

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
        customer.setId(generateUniqueCustomerId());
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer customer) {
        if (customerRepository.existsById(id)) {
            customer.setId(id);
            return customerRepository.save(customer);
        } else {
            throw new ResourceNotFoundException("Customer not found with id " + id);
        }

    }

    public void deleteCustomer(Long id) {
        customerRepository.deleteById(id);
    }



}
