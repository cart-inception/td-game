# Docker Deployment for Tower Defense Game

This document provides instructions for deploying the Tower Defense Game using Docker and Dokploy on a Hostinger VPS.

## Prerequisites

- A Hostinger VPS with Docker template installed
- SSH access to your VPS
- Git repository access for the game code
- Domain name (optional, but recommended)

## Deployment Files

The following Docker-related files are included in this repository:

- `docker-compose.yml`: Defines the services (frontend, backend, MongoDB)
- `Dockerfile.frontend`: Instructions for building the frontend container
- `Dockerfile.backend`: Instructions for building the backend container
- `nginx.conf`: Configuration for load balancing (used when scaling)
- `.env.example`: Example environment variables (copy to `.env` and customize)

## Deployment Steps

### 1. Prepare Your Environment

1. SSH into your Hostinger VPS:
   ```bash
   ssh root@your_vps_ip
   ```

2. Install Dokploy:
   ```bash
   mkdir -p /opt/dokploy
   cd /opt/dokploy
   curl -fsSL https://get.dokploy.com -o get-dokploy.sh
   chmod +x get-dokploy.sh
   ./get-dokploy.sh
   ```

3. Access the Dokploy dashboard at `http://your_vps_ip:9000` and create an admin account

### 2. Configure Environment Variables

1. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to update the environment variables:
   ```bash
   # Replace these values with your actual configuration
   VPS_IP=your_vps_ip
   NEXT_PUBLIC_SOCKET_URL=http://your_vps_ip:3001
   ```

### 3. Deploy with Dokploy

1. In the Dokploy dashboard, create a new application:
   - Click "Create Application"
   - Select "Docker Compose" as the configuration method

2. Configure the source code:
   - Enter your application name (e.g., "tower-defense-game")
   - Select "Git" as the source
   - Enter your Git repository URL
   - Provide authentication details if required
   - Specify the branch to deploy (e.g., "main" or "master")

3. Configure the Docker Compose path:
   - Enter "./docker-compose.yml" as the path

4. Configure environment variables in the "Environment" tab:
   - Add all variables from your `.env` file

5. Deploy your application by clicking the "Deploy" button

### 4. Domain and SSL Setup

If you have a domain name:

1. Configure your domain's DNS:
   - Create an A record pointing to your VPS IP address

2. Install Nginx:
   ```bash
   apt update
   apt install -y nginx
   ```

3. Create a new Nginx configuration:
   ```bash
   nano /etc/nginx/sites-available/tower-defense
   ```

4. Add this configuration (replace yourdomain.com with your actual domain):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. Enable the configuration:
   ```bash
   ln -s /etc/nginx/sites-available/tower-defense /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

6. Install SSL with Let's Encrypt:
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

### 5. Scaling Your Game (Optional)

To handle more players, you can scale your backend service. Edit your `docker-compose.yml` file to include:

```yaml
backend:
  # ... existing configuration
  deploy:
    replicas: 3
```

And add the Nginx load balancer service:

```yaml
nginx:
  image: nginx:latest
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
  depends_on:
    - backend
```

## Database Backups

To set up automated MongoDB backups:

1. Create a backup script:
   ```bash
   mkdir -p /opt/backups
   nano /opt/backups/backup-mongodb.sh
   ```

2. Add this content:
   ```bash
   #!/bin/bash
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="/opt/backups/mongodb"
   mkdir -p $BACKUP_DIR

   # Run mongodump inside the container
   docker exec -it $(docker ps -qf "name=mongodb") mongodump --out=/data/db/backup

   # Copy the backup from the container
   docker cp $(docker ps -qf "name=mongodb"):/data/db/backup $BACKUP_DIR/backup_$TIMESTAMP

   # Clean up old backups (keep last 7 days)
   find $BACKUP_DIR -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
   ```

3. Set up a daily cron job:
   ```bash
   chmod +x /opt/backups/backup-mongodb.sh
   crontab -e
   # Add: 0 2 * * * /opt/backups/backup-mongodb.sh
   ```

## Troubleshooting

If you encounter issues:

1. Check container logs in the Dokploy dashboard
2. Verify environment variables are correctly set
3. Check network connectivity between services
4. Ensure MongoDB volume permissions are correct
5. Verify Nginx proxy settings for WebSocket support

For further assistance, consult the full deployment guide or contact your hosting provider.