# SecureVault Pro - Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Port 3000 available  
- At least 2GB RAM
- Linux/macOS/Windows with WSL2

## Quick Start

```bash
# Navigate to challenge directory
cd Web/vibe_slep

# Start the challenge
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

## Access the Challenge

Open your browser and navigate to:
```
http://localhost:3000
```

## Stop the Challenge

```bash
# Stop containers
docker-compose down

# Remove all data (full reset)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Reset Challenge State
```bash
# Complete reset
docker-compose down -v
docker-compose up -d
```

## Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Check Database
```bash
# Access MongoDB shell
docker exec -it securevault-db mongosh securevault_prod -u svadmin -p sv2024prod

# View collections
> show collections
> db.users.find()
```

## Security Notes

⚠️ **WARNING**: This challenge contains intentional security vulnerabilities. Only run in isolated environments!

- Do not expose to public internet
- Use only for CTF/training purposes
- Reset after each session

## Default Credentials

No default user credentials are provided. Players must exploit vulnerabilities to gain access.

## Support

For issues, check the logs first:
```bash
docker-compose logs --tail=50