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
     * - Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
     * - Headers: Authorization, Content-Type, etc.
     * - Credentials: true (for cookies/auth headers)
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow the Vercel frontend origin
        configuration.setAllowedOrigins(List.of(
            "https://learn-spherel.vercel.app",
            "http://localhost:4200",      // Local Angular dev
            "http://localhost:3000"       // Alternative local
        ));
        
        // Allow all HTTP methods including OPTIONS for preflight
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Allow common headers needed for API calls
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Expose headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // Allow credentials (cookies, auth headers)
        configuration.setAllowCredentials(true);
        
        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Security Filter Chain - DEBUGGING MODE
     * 
     * Temporarily permissive configuration for debugging 403 errors:
     * - All requests are allowed
     * - CSRF disabled
     * - CORS fully enabled
     * - JWT filter disabled temporarily
     * 
     * NOTE: This is for debugging only. After fixing issues, re-enable JWT authentication.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Enable CORS with the configuration above
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Disable CSRF for API endpoints (stateless API)
            .csrf(csrf -> csrf.disable())
            
            // Allow all requests for debugging (temporary)
            .authorizeHttpRequests(authz -> authz
                // Allow all OPTIONS requests globally (preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Allow all requests for debugging
                .anyRequest().permitAll()
            )
            
            // Use stateless session management
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        // JWT filter disabled temporarily for debugging
        // Uncomment the line below when ready to re-enable JWT authentication:
        // .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
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
