package com.learnsphere.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * SecurityConfig - Spring Security & CORS Configuration
 * 
 * DEBUGGING MODE - Temporarily permissive for troubleshooting 403 errors
 * 
 * Current configuration:
 * 1. CORS enabled for Vercel frontend (https://learn-spherel.vercel.app)
 * 2. All OPTIONS preflight requests permitted
 * 3. All requests allowed (JWT disabled for debugging)
 * 4. CSRF disabled
 * 5. Stateless session management
 * 
 * PRODUCTION FIX: Re-enable JWT authentication by uncommenting the line in securityFilterChain()
 * and changing .anyRequest().permitAll() to .anyRequest().authenticated()
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    /**
     * CORS Configuration Source
     * 
     * Configures CORS to allow:
     * - Frontend origin: https://learn-spherel.vercel.app
     * - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
     * - Headers: Authorization, Content-Type, etc.
     * - Credentials: true (for cookies/auth headers)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow the Vercel frontend origin
        configuration.setAllowedOrigins(List.of(
            "https://learnsphere-campus.vercel.app",
            "http://localhost:4200",
            "http://localhost:3000"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Allow all common headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Origin",
            "Content-Type",
            "Accept",
            "Authorization",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Expose headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Total-Count"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Cache preflight
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Security Filter Chain - DEBUGGING MODE
     * 
     * All requests allowed, CORS fully enabled
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with the configuration source
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF for API
            .csrf(csrf -> csrf.disable())
            
            // Disable authentication check for debugging
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().permitAll()
            )
            
            // Use stateless session
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }

    /**
     * Authentication Manager Bean
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * BCrypt Password Encoder Bean
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
