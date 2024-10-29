package com.example.BillingApplication.controller;

import com.example.BillingApplication.model.User;
import com.example.BillingApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        User newUser = userService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        User loggedInUser = userService.login(username, password);
        return ResponseEntity.ok(loggedInUser);
    }
    @GetMapping("/profile/{id}")
    public User getCustomerProfile(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}

