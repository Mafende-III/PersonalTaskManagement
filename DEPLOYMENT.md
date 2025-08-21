# Deployment Guide for Coolify on Hostinger VPS

This guide covers deploying the Personal Task Management application using Coolify on a Hostinger VPS.

## Prerequisites

- Hostinger VPS with Ubuntu 24.04 with Coolify template
- Domain name (optional but recommended)
- Git repository access
- Basic understanding of environment variables

## Quick Start

1. **Access your Coolify dashboard**
   - Navigate to `http://your-vps-ip:3000`
   - Complete the initial setup with your admin account

2. **Create a new project**
   - Click "New Project" in the Coolify dashboard
   - Name your project (e.g., "task-management")

3. **Add your application**
   - Choose "Git Repository" as the source
   - Connect your Git provider (GitHub, GitLab, etc.)
   - Select this repository

## Configuration

### Environment Variables

Set the following environment variables in Coolify:

#### Required Variables
```env
NODE_ENV=production
PORT=5002
DATABASE_URL=postgresql://taskuser:your-password@postgres:5432/task_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```

#### Database Variables (if using separate PostgreSQL service)
```env
DB_USER=taskuser
DB_PASSWORD=your-secure-password-here
DB_NAME=task_management
DB_PORT=5432
```

#### Optional Variables
```env
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://your-domain.com
```

#### Email Configuration (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Build Configuration

The application uses a multi-stage Dockerfile optimized for production:

- **Build pack**: Dockerfile (automatically detected)
- **Build command**: Handled by Dockerfile
- **Start command**: `node server/dist/server.js`
- **Health check**: `/health` endpoint on port 5002

## Database Setup

### Option 1: Using Docker Compose (Recommended)

The included `docker-compose.yml` sets up both the application and PostgreSQL database:

1. In Coolify, select "Docker Compose" as the deployment method
2. Upload or paste the contents of `docker-compose.yml`
3. Set the environment variables in Coolify

### Option 2: Separate Database Service

1. Create a PostgreSQL database in Coolify:
   - Go to Resources → Databases → Add Database
   - Choose PostgreSQL 16
   - Set database name, username, and password
   - Note the connection details

2. Update your application's `DATABASE_URL` environment variable

### Database Migrations

The application automatically runs database migrations on startup via the `docker-entrypoint.sh` script:

1. Waits for database connection
2. Runs `prisma migrate deploy`
3. Generates Prisma client
4. Starts the application

## Deployment Steps

### Using Dockerfile (Single Container)

1. **Set Build Configuration**:
   - Build Pack: `dockerfile`
   - Dockerfile: `Dockerfile`
   - Build Directory: `/`

2. **Configure Environment**:
   - Add all required environment variables
   - Mark `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` as build variables if needed

3. **Set Port Configuration**:
   - Port: `5002`
   - Health check path: `/health`

4. **Deploy**:
   - Click "Deploy" in Coolify
   - Monitor the build logs
   - Wait for the health check to pass

### Using Docker Compose (Recommended)

1. **Upload Docker Compose**:
   - Choose "Docker Compose" deployment
   - Upload `docker-compose.yml`

2. **Set Environment Variables**:
   - All variables will be passed to the containers
   - Ensure database password is set

3. **Deploy**:
   - Click "Deploy"
   - Both app and database containers will start
   - Application will wait for database to be ready

## SSL/HTTPS Configuration

Coolify automatically handles SSL certificates:

1. **Add Custom Domain**:
   - Go to your application settings
   - Add your domain name
   - Coolify will automatically request Let's Encrypt certificate

2. **DNS Configuration**:
   - Point your domain's A record to your VPS IP
   - Wait for DNS propagation

## Post-Deployment

### Health Checks

- Application health: `https://your-domain.com/health`
- API test endpoint: `https://your-domain.com/api/test`

### Initial Setup

1. **Access the application**:
   - Navigate to your domain or `http://vps-ip:5002`
   - Complete the registration process

2. **Create admin user**:
   - The first registered user becomes admin
   - Or run the admin creation script if needed

### Monitoring

- **Logs**: View application logs in Coolify dashboard
- **Metrics**: Monitor resource usage in Coolify
- **Health**: Regular health checks ensure uptime

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check `DATABASE_URL` format
   - Ensure database service is running
   - Verify network connectivity between containers

2. **Build Failures**:
   - Check build logs for specific errors
   - Ensure all dependencies are correctly specified
   - Verify Dockerfile syntax

3. **Health Check Failures**:
   - Verify the `/health` endpoint is accessible
   - Check if the application is binding to the correct port
   - Ensure health check timeout is sufficient

### Debugging Commands

```bash
# View application logs
docker logs <container-name>

# Check database connectivity
docker exec -it <app-container> node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('Connected')).catch(console.error);
"

# Manual migration run
docker exec -it <app-container> npx prisma migrate deploy
```

## Security Considerations

1. **Environment Variables**:
   - Use strong, unique secrets for JWT tokens
   - Never commit secrets to version control
   - Rotate secrets periodically

2. **Database Security**:
   - Use strong database passwords
   - Consider database connection limits
   - Regular backups through Coolify

3. **Network Security**:
   - Configure Hostinger firewall if needed
   - Use HTTPS for all production traffic
   - Monitor access logs

## Scaling and Performance

### Vertical Scaling
- Increase VPS resources in Hostinger control panel
- Restart services in Coolify after scaling

### Database Optimization
- Monitor database performance
- Consider connection pooling for high traffic
- Regular database maintenance

### Application Performance
- Monitor response times via Coolify
- Optimize client bundle size
- Use CDN for static assets if needed

## Backup and Disaster Recovery

1. **Database Backups**:
   - Configure automatic backups in Coolify
   - Test backup restoration procedure

2. **Application Code**:
   - Ensure Git repository is properly maintained
   - Document any manual configuration changes

3. **Recovery Plan**:
   - Document recovery steps
   - Test disaster recovery procedures
   - Keep environment variable backups secure

## Support and Resources

- **Coolify Documentation**: https://coolify.io/docs/
- **Hostinger Support**: Available in your hosting panel
- **Application Repository**: Check README.md for additional setup information
- **Prisma Documentation**: https://www.prisma.io/docs/ for database-related issues

## Updates and Maintenance

### Application Updates
1. Push changes to your Git repository
2. Redeploy in Coolify (auto-deploy can be enabled)
3. Monitor deployment logs
4. Verify application functionality

### Dependencies Updates
- Regularly update Node.js dependencies
- Test updates in development environment first
- Monitor security advisories

### System Updates
- Keep VPS system updated via Hostinger panel
- Update Coolify when new versions are available
- Monitor system resource usage

---

This deployment guide ensures a smooth and secure deployment of your Personal Task Management application on Coolify with Hostinger VPS. Follow the steps carefully and monitor your application after deployment.