package com.learnsphere.backend.controller;

import com.learnsphere.backend.entity.UserAccount;
import com.learnsphere.backend.entity.UserRole;
import com.learnsphere.backend.repository.RoleRepository;
import com.learnsphere.backend.repository.UserAccountRepository;
import com.learnsphere.backend.repository.UserRoleRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.learnsphere.backend.security.JwtUtil;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountRepository userAccountRepository;
    private final UserRoleRepository userRoleRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserAccountRepository userAccountRepository,
                          UserRoleRepository userRoleRepository,
                          RoleRepository roleRepository,
                          JwtUtil jwtUtil) {
        this.userAccountRepository = userAccountRepository;
        this.userRoleRepository = userRoleRepository;
        this.roleRepository = roleRepository;
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public UserAccount register(@RequestBody Map<String, String> data) {

        UserAccount user = new UserAccount();
        user.setFullName(data.get("fullName"));
        user.setEmail(data.get("email"));
        user.setPassword(passwordEncoder.encode(data.get("password")));
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());

        UserAccount savedUser = userAccountRepository.save(user);

        // assign role
        String roleName = data.get("role"); // STUDENT / INSTRUCTOR / ADMIN
        var role = roleRepository.findByName(roleName);

        if (role == null) {
            throw new RuntimeException("Role '" + roleName + "' not found in the database. Please ensure roles are initialized.");
        }

        UserRole userRole = new UserRole();
        userRole.setUser(savedUser);
        userRole.setRole(role);
        userRole.setAssignedAt(LocalDateTime.now());

        userRoleRepository.save(userRole);

        return savedUser;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> data) {

        // 1. Find user by email
        UserAccount user = userAccountRepository
                .findByEmail(data.get("email"))
                .orElse(null);

        if (user == null) return "Invalid email";

        // 2. Verify password
        if (!passwordEncoder.matches(data.get("password"), user.getPassword())) {
            return "Invalid password";
        }

        // 3. Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userAccountRepository.save(user);

        // 4. Retrieve roles and handle potential empty list (Root Cause of 500)
        var userRoles = userRoleRepository.findByUser_UserId(user.getUserId());
        
        if (userRoles == null || userRoles.isEmpty()) {
            return "Error: No role assigned to this user. Contact Admin.";
        }

        // 5. Extract role name (Assuming one primary role as per your structure)
        String roleName = userRoles.get(0).getRole().getName();

        // 6. Generate and return the JWT
        return jwtUtil.generateToken(user.getEmail(), roleName, user.getUserId());
    }
}
