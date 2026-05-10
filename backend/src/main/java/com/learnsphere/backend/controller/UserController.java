package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.UserAccount;
import com.learnsphere.backend.repository.UserAccountRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAccountRepository userAccountRepository;

    public UserController(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    // Create user
    @PostMapping
    public UserAccount createUser(@RequestBody UserAccount user) {
        return userAccountRepository.save(user);
    }

    // Get all users
    @GetMapping
    public List<UserAccount> getAllUsers() {
        return userAccountRepository.findAll();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public UserAccount getUserById(@PathVariable Long id) {
        return userAccountRepository.findById(id).orElse(null);
    }
}
