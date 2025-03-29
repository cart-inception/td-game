#!/bin/bash

# Deploy script for Tower Defense Game
# This script prepares the environment and starts the Docker Compose services

# Check if VPS_IP is provided
if [ -z "$VPS_IP" ]; then
    echo "Error: VPS_IP environment variable is not set"
    echo "Usage: VPS_IP=your_vps_ip bash deploy.sh"
    exit 1
fi

echo "=== Tower Defense Game Deployment ==="
echo "VPS IP: $VPS_IP"

# Create necessary directories
echo "Creating data directories..."
mkdir -p ../files/mongodb_data

# Set correct permissions
echo "Setting directory permissions..."
chmod -R 777 ../files/mongodb_data

# Replace placeholders in env files
echo "Configuring environment variables..."
sed "s/__VPS_IP__/$VPS_IP/g" .env.production > .env

# Start Docker Compose services
echo "Starting Docker Compose services..."
docker-compose down
docker-compose up -d

echo "=== Deployment Complete ==="
echo "Frontend: http://$VPS_IP:3000"
echo "Backend Socket.io: http://$VPS_IP:3001"
echo "MongoDB: mongodb://$VPS_IP:27017"

# Show running containers
echo "=== Running Containers ==="
docker-compose ps