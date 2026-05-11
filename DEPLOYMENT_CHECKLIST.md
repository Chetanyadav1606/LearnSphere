# Render Deployment Checklist - Spring Boot Backend

## Pre-Deployment: Code Changes
- [x] Updated SecurityConfig.java with CORS configuration
- [x] Verified JwtFilter is properly integrated
- [x] Verified AuthController with public endpoints
- [x] Verified application.properties uses environment variables
- [x] Confirmed JWT implementation in JwtUtil

## Database Setup (PostgreSQL on Render)
- [ ] Create PostgreSQL database on Render
- [ ] Note the database credentials:
  - Host: `{render-postgres-host}`
  - Port: `5432`
  - Database: `learnsphere`
  - Username: `{db-user}`
  - Password: `{db-password}`

## Render Application Configuration
1. **Create New Web Service**
   - Repository: Your GitHub repo
   - Build Command: `./mvnw clean package -DskipTests`
   - Start Command: `java -jar target/learnsphere-backend-0.0.1-SNAPSHOT.jar`

2. **Environment Variables in Render Dashboard**
   ```
   DATABASE_URL=jdbc:postgresql://{host}:{port}/learnsphere
   DATABASE_USER={db-user}
   DATABASE_PASS={db-password}
   PORT=8080
   ```

3. **Custom Domain (Optional)**
   - Add custom domain in Render settings
   - Update Angular environment configuration

## Pre-Deployment Testing (Local)

### 1. Start Backend Locally
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

Backend URL: `http://localhost:8080`

### 2. Test Auth Endpoints (PUBLIC)
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "STUDENT"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Response should be JWT token: eyJhbGc...
```

### 3. Test CORS Preflight (OPTIONS)
```bash
curl -X OPTIONS http://localhost:8080/api/users \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Expected Response Headers:
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
Access-Control-Max-Age: 3600
```

### 4. Test Protected Endpoint (with JWT)
```bash
# Get token from login
TOKEN="eyJhbGc..." # from login response

# Use token in request
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:4200"
```

Expected Response: 200 OK with data

## Angular Frontend Configuration

### Update environment.ts
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://{your-backend}.onrender.com'
};
```

### Update proxy.conf.json (for local development)
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### HTTP Interceptor Setup
```typescript
// src/app/core/interceptors/auth.interceptor.ts
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req);
  }
}

// In app.module.ts or app.config.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "fix: Update SecurityConfig with CORS configuration"
git push origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure build and start commands (see above)
5. Add environment variables
6. Deploy

### Step 3: Monitor Deployment
- Check Render build logs
- Verify database connection
- Monitor for errors

### Step 4: Verify Backend
```bash
# Health check
curl https://{your-backend}.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Post-Deployment Verification

### 1. Backend Health
- [ ] Backend is running on Render
- [ ] Database is connected
- [ ] No errors in Render logs

### 2. CORS Working
- [ ] Preflight OPTIONS requests return 200
- [ ] CORS headers are present
- [ ] Browser console shows no CORS errors

### 3. Authentication Working
- [ ] Login endpoint returns JWT
- [ ] Protected endpoints require valid JWT
- [ ] 401 errors on invalid/missing tokens

### 4. Angular Requests
- [ ] Login requests succeed
- [ ] API requests with JWT token work
- [ ] No [object ProgressEvent] errors
- [ ] No CORS errors in browser console

## Common Issues & Solutions

### Issue: Preflight returns 401
**Solution**: OPTIONS method must be allowed globally - check SecurityConfig

### Issue: Database connection fails
**Solution**: Verify DATABASE_URL, DATABASE_USER, DATABASE_PASS in Render

### Issue: CORS headers missing
**Solution**: Ensure CorsConfigurationSource bean is properly configured

### Issue: JWT token invalid
**Solution**: Check token expiration, secret key matches

### Issue: Port already in use
**Solution**: Render assigns PORT automatically via environment variable

## Rollback Plan
If deployment has issues:
1. Revert to previous version in GitHub
2. Redeploy from Render dashboard
3. Check error logs for root cause

## Performance Monitoring
1. Monitor API response times in Render
2. Check database performance
3. Monitor error rates
4. Scale resources if needed

## Security Checklist
- [ ] HTTPS enabled (Render provides by default)
- [ ] JWT secret is secure (minimum 32 characters)
- [ ] Credentials are stored in environment variables
- [ ] CORS restricted to known origins
- [ ] No sensitive data in logs

## Support Resources
- Render Support: https://render.com/support
- Spring Boot Docs: https://spring.io/projects/spring-boot
- PostgreSQL Docs: https://www.postgresql.org/docs/
- JWT Docs: https://jwt.io/
