# Deployment Guide: Tower Defense Game on Hostinger VPS with Dokploy

This guide provides step-by-step instructions for deploying your multiplayer tower defense game on a Hostinger VPS using Dokploy for container management.

## Prerequisites

Before starting the deployment process, ensure you have:

- A Hostinger VPS with Docker template installed
- SSH access to your VPS
- Your tower defense game code in a Git repository
- Basic familiarity with Docker and Docker Compose

## 1. Setting Up Your Hostinger VPS

### Purchase a Suitable VPS Plan

1. Visit [Hostinger's Docker hosting page](https://www.hostinger.com/vps/docker-hosting)
2. Select a plan with at least 4GB RAM and 2 vCPUs (recommended for a multiplayer game)
3. During setup, select the Ubuntu 24.04 with Docker template

### Connect to Your VPS

Open Terminal (Linux/macOS) or Command Prompt/PowerShell (Windows) and connect to your VPS:

```bash
ssh root@your_vps_ip
```

Replace `your_vps_ip` with your actual VPS IP address.

### Verify Docker Installation

Confirm that Docker and Docker Compose are installed correctly:

```bash
docker --version
docker-compose --version
```

## 2. Installing Dokploy

Dokploy is a container management tool that simplifies deploying and managing Docker Compose applications.

### Install Dokploy

Run the following commands to install Dokploy:

```bash
mkdir -p /opt/dokploy
cd /opt/dokploy

# Download the Dokploy installation script
curl -fsSL https://get.dokploy.com -o get-dokploy.sh

# Make the script executable
chmod +x get-dokploy.sh

# Run the installation script
./get-dokploy.sh
```

### Access Dokploy Dashboard

After installation, Dokploy will be available at:

```
http://your_vps_ip:9000
```

1. Open this URL in your browser
2. Create an admin account when prompted
3. Log in to the Dokploy dashboard

## 3. Preparing Your Game for Deployment

### Create a Docker Compose File

In your game project repository, create a `docker-compose.yml` file in the root directory:

```yaml
version: '3.8'

services:
  # Frontend service (Next.js with Phaser)
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SOCKET_URL=http://your_vps_ip:3001
    depends_on:
      - backend

  # Backend service (Node.js with Express and Socket.io)
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/tower-defense
    depends_on:
      - mongodb

  # MongoDB service
  mongodb:
    image: mongo:latest
    restart: always
    volumes:
      - "../files/mongodb_data:/data/db"
    ports:
      - "27017:27017"

volumes:
  mongodb_data:
```

### Create Dockerfiles

Create two Dockerfiles for your frontend and backend services:

`Dockerfile.frontend`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

`Dockerfile.backend`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Push Your Code to a Git Repository

Ensure your code, including the Docker Compose file and Dockerfiles, is pushed to a Git repository (GitHub, GitLab, etc.).

## 4. Deploying with Dokploy

### Create a New Application

1. Log in to the Dokploy dashboard
2. Click on "Create Application"
3. Select "Docker Compose" as the configuration method

### Configure Source Code

1. In the "General" tab:
   - Enter a name for your application (e.g., "tower-defense-game")
   - Select "Git" as the source
   - Enter your Git repository URL
   - Provide authentication details if required (SSH key or username/password)
   - Specify the branch to deploy (e.g., "main" or "master")

2. Configure the Docker Compose path:
   - Enter the path to your Docker Compose file (e.g., "./docker-compose.yml")

### Configure Environment Variables

1. In the "Environment" tab:
   - Add any necessary environment variables for your application
   - For example:
     ```
     NODE_ENV=production
     MONGODB_URI=mongodb://mongodb:27017/tower-defense
     NEXT_PUBLIC_SOCKET_URL=http://your_vps_ip:3001
     ```

### Configure Volumes

1. In the "Advanced" tab:
   - Ensure your MongoDB data is stored in a persistent volume
   - Use the recommended "../files/" path for persistent storage:
     ```
     volumes:
       - "../files/mongodb_data:/data/db"
     ```

### Deploy Your Application

1. Click the "Deploy" button to start the deployment process
2. Dokploy will:
   - Pull your code from the Git repository
   - Build Docker images based on your Dockerfiles
   - Start the containers defined in your Docker Compose file
3. Monitor the deployment logs in real-time

### Monitor Your Deployment

1. In the "Logs" tab:
   - View logs for each service to ensure everything is running correctly
2. In the "Monitoring" tab:
   - Monitor the health and resource usage of your containers

## 5. Setting Up Domain and SSL

### Configure Domain Name

1. In your domain registrar or Hostinger control panel:
   - Create an A record pointing to your VPS IP address

2. Set up a reverse proxy with Nginx:
   ```bash
   # Install Nginx
   apt update
   apt install -y nginx

   # Create a new Nginx configuration file
   nano /etc/nginx/sites-available/tower-defense
   ```

3. Add the following configuration:
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

4. Enable the configuration:
   ```bash
   ln -s /etc/nginx/sites-available/tower-defense /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

### Set Up SSL with Let's Encrypt

1. Install Certbot:
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. Obtain and configure SSL certificates:
   ```bash
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. Follow the prompts to complete the SSL setup

## 6. Updating Your Application

### Automated Updates with Webhooks

1. In the Dokploy dashboard:
   - Go to your application settings
   - Navigate to the "Deployments" tab
   - Enable webhooks for automatic deployment

2. Configure your Git repository to trigger the webhook on push events:
   - Copy the webhook URL from Dokploy
   - Add it to your repository's webhook settings
   - Set it to trigger on push events to your deployment branch

### Manual Updates

To manually update your application:

1. Push changes to your Git repository
2. In the Dokploy dashboard:
   - Go to your application
   - Click the "Deploy" button to pull the latest changes and rebuild

## 7. Scaling Your Game

### Horizontal Scaling

To handle more players, you can scale your backend service:

1. Update your Docker Compose file:
   ```yaml
   backend:
     # ... existing configuration
     deploy:
       replicas: 3
   ```

2. Add a load balancer service:
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

3. Create an `nginx.conf` file for load balancing:
   ```nginx
   events {
     worker_connections 1024;
   }

   http {
     upstream backend {
       server backend:3001;
       # Additional backend instances will be automatically added
     }

     server {
       listen 80;

       location / {
         proxy_pass http://frontend:3000;
       }

       location /socket.io/ {
         proxy_pass http://backend;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
       }
     }
   }
   ```

4. Redeploy your application in Dokploy

### Vertical Scaling

If you need more resources for your VPS:

1. Log in to your Hostinger control panel
2. Upgrade your VPS plan to one with more CPU and RAM
3. No changes to your Dokploy configuration are needed

## 8. Monitoring and Maintenance

### Monitoring with Dokploy

1. Use the Dokploy monitoring dashboard to:
   - Track container health
   - Monitor resource usage
   - View application logs

### Database Backups

Set up automated MongoDB backups:

1. Create a backup script:
   ```bash
   mkdir -p /opt/backups
   nano /opt/backups/backup-mongodb.sh
   ```

2. Add the following content:
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

3. Make the script executable and set up a cron job:
   ```bash
   chmod +x /opt/backups/backup-mongodb.sh
   crontab -e
   ```

4. Add the following line to run daily backups:
   ```
   0 2 * * * /opt/backups/backup-mongodb.sh
   ```

## 9. Troubleshooting

### Common Issues and Solutions

1. **Container fails to start**:
   - Check logs in Dokploy dashboard
   - Verify environment variables are correctly set
   - Ensure MongoDB volume permissions are correct

2. **WebSocket connection issues**:
   - Verify Nginx proxy settings for WebSocket support
   - Check that Socket.io server is running
   - Confirm firewall allows WebSocket connections

3. **Database connection problems**:
   - Verify MongoDB container is running
   - Check connection string in environment variables
   - Ensure MongoDB data volume is properly configured

4. **Performance issues**:
   - Monitor resource usage in Dokploy
   - Consider scaling up your VPS or services
   - Optimize your application code and database queries

### Getting Help

If you encounter issues with Dokploy:
- Check the [Dokploy documentation](https://docs.dokploy.com/)
- Visit the Dokploy community forums
- Contact Hostinger support for VPS-related issues

## Conclusion

You've successfully deployed your multiplayer tower defense game on a Hostinger VPS using Dokploy for container management. This setup provides a scalable, maintainable environment for your game, with automated deployments and comprehensive monitoring.

Remember to regularly:
- Back up your database
- Monitor system resources
- Update your application with new features and bug fixes
- Scale your infrastructure as your player base grows

With this deployment architecture, your tower defense game can support up to 6 players simultaneously while maintaining good performance and reliability.
