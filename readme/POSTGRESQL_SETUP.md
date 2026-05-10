# PostgreSQL Setup Guide for LearnSphere

## Quick Start

### 1. Install PostgreSQL
- Download from [postgresql.org](https://www.postgresql.org/download/)
- Follow installation wizard
- Remember the password for `postgres` user

### 2. Create Database
```bash
# Open PostgreSQL command line (psql)
psql -U postgres

# Create database
CREATE DATABASE learnsphere_db;

# Verify
\l
```

### 3. Verify Connection
The backend (application.properties) expects:
```
Host: localhost
Port: 5432
Database: learnsphere_db
Username: postgres
Password: root  (change if needed in application.properties)
```

## Database Initialization

### First Time Setup
1. Start PostgreSQL service
2. Create `learnsphere_db` database
3. Backend will automatically create tables via Hibernate (`spring.jpa.hibernate.ddl-auto=update`)

### Verify Tables Created
```bash
psql -U postgres -d learnsphere_db

# List tables
\dt

# Show table structure
\d user_account
```

## Common PostgreSQL Commands

```bash
# Connect to database
psql -U postgres -d learnsphere_db

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Execute SQL file
\i /path/to/file.sql

# Backup database
pg_dump -U postgres learnsphere_db > backup.sql

# Restore database
psql -U postgres learnsphere_db < backup.sql

# Exit psql
\q
```

## Windows-Specific Setup

### Environment Variables
```bash
# Add PostgreSQL bin to PATH
C:\Program Files\PostgreSQL\16\bin

# Verify installation
psql --version
```

### Using pgAdmin (GUI Tool)
1. Install pgAdmin (included with PostgreSQL)
2. Open pgAdmin from Start Menu
3. Connect to localhost:5432
4. Create new database: learnsphere_db
5. Configure connection in application.properties

## Troubleshooting

### Connection Refused
- Verify PostgreSQL service is running: `Services` → `PostgreSQL`
- Check port 5432 is not blocked by firewall
- Verify postgres user password matches application.properties

### Database Not Found
```bash
# List existing databases
psql -U postgres -l

# Create if missing
psql -U postgres -c "CREATE DATABASE learnsphere_db;"
```

### Permission Denied
- Log in as postgres user: `psql -U postgres`
- Grant permissions: `GRANT ALL PRIVILEGES ON DATABASE learnsphere_db TO postgres;`

## Application Configuration

### Update if Different Credentials

Edit: `src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/learnsphere_db
spring.datasource.username=postgres
spring.datasource.password=root  # Change if different

# Other settings
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update  # auto-create tables
```

## Backup & Restore

### Full Backup
```bash
pg_dump -U postgres -h localhost -d learnsphere_db > backup.sql
```

### Restore from Backup
```bash
psql -U postgres -d learnsphere_db < backup.sql
```

### Scheduled Backups (Windows Task Scheduler)
Create batch file: `backup.bat`
```batch
@echo off
SET PGPASSWORD=root
pg_dump -U postgres -h localhost learnsphere_db > "D:\backups\learnsphere_%date:~10,4%%date:~4,2%%date:~7,2%.sql"
```

## Performance Tips

1. **Connection Pooling** - Backend uses HikariCP (configured in pom.xml)
2. **Indexing** - Add indexes on frequently queried columns
3. **Query Optimization** - Use JPA/Hibernate efficiently
4. **Maintenance**:
   ```sql
   VACUUM ANALYZE learnsphere_db;  -- Optimize database
   REINDEX DATABASE learnsphere_db;  -- Rebuild indexes
   ```

## Uninstall (if needed)

### Windows
- Control Panel → Programs → Programs and Features
- Find "PostgreSQL" → Uninstall
- Choose whether to delete data directory

### After Uninstall
```bash
# Verify removal
psql --version  # Should fail
```
