package com.dashboard.generator.controller;

import com.dashboard.generator.dto.auth.AuthResponse;
import com.dashboard.generator.dto.auth.LoginRequest;
import com.dashboard.generator.dto.auth.RegisterRequest;
import com.dashboard.generator.dto.common.ApiResponse;
import com.dashboard.generator.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        // JWT tokens are stateless, so we just return success
        // The frontend should remove the token from storage
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserDto>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            AuthResponse.UserDto userDto = new AuthResponse.UserDto();
            // You would typically get the user from the database here
            // For now, we'll return basic info from the authentication
            return ResponseEntity.ok(ApiResponse.success(userDto));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("User not authenticated"));
    }
} 