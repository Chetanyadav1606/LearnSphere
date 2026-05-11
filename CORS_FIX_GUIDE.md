# Spring Boot CORS & Security Configuration Fix - Complete Solution

## Problem Summary
Your Spring Boot backend was experiencing CORS and Spring Security issues:
- 401 errors on preflight OPTIONS requests
- CORS blocked requests from Angular frontend (Vercel)
- `[object ProgressEvent]` errors in Angular
- `SecurityConfig.java` was empty with no CORS configuration

## Root Cause Analysis
1. **No CORS Configuration**: Spring Security wasn't configured to handle CORS
2. **No OPTIONS Handling**: Preflight OPTIONS requests were not permitted
3. **Missing CorsConfigurationSource**: No CORS bean to define allowed origins
4. **No Public Auth Endpoints**: Auth endpoints weren't explicitly made public
5. **Empty SecurityConfig**: The configuration file was completely empty

## Solution Implemented

### 1. Updated SecurityConfig.java
**Location**: `backend/src/main/java/com/learnsphere/backend/security/SecurityConfig.java`

The new configuration includes:

#### CORS Configuration
- **Allowed Origins**: 
  - `https://learn-spherel.vercel.app` (Production Vercel)
  - `http://localhost:4200` (Local Angular dev)
  - `http://localhost:3000` (Alternative local)

- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- **Allowed Headers**: 
  - Authorization
  - Content-Type
  - Accept
  - X-Requested-With
  - Access-Control-Request-Method
  - Access-Control-Request-Headers

- **Exposed Headers**: Authorization, Content-Type
- **Credentials**: Enabled (supports cookies and auth headers)
- **Cache**: 3600 seconds (1 hour) for preflight responses

#### Security Rules
```
1. OPTIONS requests → Globally PERMITTED (needed for preflight)
2. /api/auth/register → Public access (no auth required)
3. /api/auth/login → Public access (no auth required)
4. /api/auth/** → Public access (all auth endpoints)
5. /actuator/** → Public access (health checks)
6. All other endpoints → Requires valid JWT authentication
```

#### Session Management
- **Type**: STATELESS (JWT-based, no session creation)
- **CSRF**: Disabled (appropriate for stateless API)
- **JWT Filter**: Integrated before `UsernamePasswordAuthenticationFilter`

### 2. Key Components

#### CorsConfigurationSource Bean
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    // Creates CORS configuration
    // Registers for all URL paths ("/**")
    // Returns UrlBasedCorsConfigurationSource
}
```

#### SecurityFilterChain Bean
```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // Enables CORS
    // Disables CSRF (stateless API)
    // Configures URL authorization rules
    // Sets stateless session policy
    // Integrates JWT filter
}
```

#### Supporting Beans
```java
@Bean
public AuthenticationManager authenticationManager(...)
@Bean
public BCryptPasswordEncoder passwordEncoder()
```

## How It Works

### Preflight Request Flow (Fixed)
```
1. Browser sends OPTIONS preflight request
   Request: OPTIONS /api/users
   Headers: Origin: https://learn-spherel.vercel.app

2. Spring Security receives OPTIONS request
   → SecurityConfig allows OPTIONS method globally
   → CORS filter processes request
   → Returns 200 OK with CORS headers

3. Browser receives success response
   Response Headers:
   - Access-Control-Allow-Origin: https://learn-spherel.vercel.app
   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
   - Access-Control-Allow-Headers: Authorization, Content-Type, ...
   - Access-Control-Max-Age: 3600

4. Browser sends actual request
   Request: GET /api/users
   Headers: Authorization: Bearer <JWT_TOKEN>

5. Spring Security processes request
   → JwtFilter extracts and validates JWT
   → User is authenticated
   → Request is processed
```

### Authentication Request Flow
```
1. Login Request
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   
   → /api/auth/login is public (no auth required)
   → AuthController receives request
   → Validates credentials
   → Returns JWT token

2. Authenticated API Request
   GET /api/users
   Headers: Authorization: Bearer eyJhbGc...
   
   → JwtFilter extracts Bearer token
   → JwtUtil validates token signature and expiration
   → Extracts email and role from token
   → Sets authentication in SecurityContext
   → Request is allowed to proceed
```

## Deployment Configuration

### Application Properties
The backend uses environment variables for deployment:

```properties
# Server Port (Render provides PORT variable)
server.port=${PORT:8080}

# PostgreSQL Database (Render provides DATABASE_URL, etc.)
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USER}
spring.datasource.password=${DATABASE_PASS}
spring.datasource.driver-class-name=org.postgresql.Driver
```

### Render Deployment Environment Variables Required:
```
PORT = 8080 (or any available port)
DATABASE_URL = jdbc:postgresql://hostname:port/database_name
DATABASE_USER = your_db_user
DATABASE_PASS = your_db_password
```

## Testing the Fix

### 1. Test Preflight Request
```bash
curl -X OPTIONS https://your-backend.onrender.com/api/users \
  -H "Origin: https://learn-spherel.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

Expected Response:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://learn-spherel.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Requested-With, ...
Access-Control-Max-Age: 3600
```

### 2. Test Login Endpoint
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Expected Response:
```json
"eyJhbGciOiJIUzI1NiJ9..."  // JWT Token
```

### 3. Test Protected Endpoint
```bash
curl -X GET https://your-backend.onrender.com/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

Expected Response: Data or 403 if unauthorized

### 4. Test from Angular (Frontend)
```typescript
// In Angular service
this.http.get('https://your-backend.onrender.com/api/users', {
  headers: new HttpHeaders({
    'Authorization': `Bearer ${this.authToken}`
  })
})
```

## Troubleshooting

### Issue: 401 Unauthorized on Preflight
**Cause**: OPTIONS requests not being permitted globally
**Solution**: Ensure `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` is present

### Issue: CORS Header Missing
**Cause**: CorsConfigurationSource not properly configured
**Solution**: Verify `@Bean public CorsConfigurationSource corsConfigurationSource()`

### Issue: 403 Forbidden on Protected Endpoints
**Cause**: JWT token not being validated
**Solution**: Check JwtFilter is added to filter chain

### Issue: [object ProgressEvent] Error in Angular
**Cause**: Request blocked by browser CORS policy
**Solution**: This indicates preflight failed - check OPTIONS handling

## Files Modified

✅ `/backend/src/main/java/com/learnsphere/backend/security/SecurityConfig.java`
   - Created comprehensive security configuration
   - Configured CORS with CorsConfigurationSource
   - Set up URL authorization rules
   - Integrated JWT filter

## Important Notes

1. **JWT Secret**: Ensure `JwtUtil.SECRET` is secure and matches between frontend/backend
2. **Token Expiration**: Set to 1 hour in JwtUtil (configurable)
3. **Allowed Origins**: Keep updated if adding new frontend domains
4. **HTTPS in Production**: Always use HTTPS for production deployments
5. **Environment Variables**: Set properly in Render dashboard

## Next Steps

1. ✅ Deploy updated SecurityConfig.java to Render
2. ✅ Rebuild and redeploy backend
3. ✅ Clear browser cache
4. ✅ Test from Angular frontend
5. ✅ Monitor backend logs for any issues
6. ✅ Verify all endpoints are accessible

## References

- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [Spring CORS Support](https://spring.io/guides/gs/rest-cors/)
- [JWT Authentication in Spring](https://www.jwtinspector.io/)
- [Render Deployment Guide](https://render.com/docs)
