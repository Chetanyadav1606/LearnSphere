package com.learnsphere.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // MUST be at least 32 characters for HS256
    private static final String SECRET =
            "learnsphere_super_secure_jwt_secret_key_12345";

    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour

    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Generate JWT
    public String generateToken(String email, String role, Long userId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract email
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extract role
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Validate token
    public boolean isTokenValid(String token) {
        return getClaims(token).getExpiration().after(new Date());
    }

    // Parse claims (modern way)
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
