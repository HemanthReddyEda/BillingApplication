package com.example.BillingApplication.controller;

import com.example.BillingApplication.model.Customer;
import com.example.BillingApplication.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "http://localhost:5173") // Allow CORS from the frontend
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @PostMapping
    public Customer addCustomer(@RequestBody Customer customer) {
        return customerService.addCustomer(customer);
    }

    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.updateCustomer(id, customer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.ok().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred");
        }
    }


    @PutMapping("/{id}/profile")
    public Customer updateCustomerProfile(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.updateCustomerProfile(id, customer);
    }


    @GetMapping("/{id}")
    public Customer getCustomerProfilee(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }
    @GetMapping("/profile/{id}")
    public ResponseEntity<Customer> getCustomerProfile(@PathVariable Long id) {
        Customer profile = customerService.findCustomerById(id);
        return profile != null ? ResponseEntity.ok(profile) : ResponseEntity.notFound().build();
    }



}