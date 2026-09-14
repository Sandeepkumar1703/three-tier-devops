# Architecture

## Multi-tier design

The application is structured as three logical layers:

1. Frontend tier
   - React with Vite
   - Client-side login and task management
   - Served through Nginx in production

2. Backend tier
   - Express API
   - JWT authentication
   - CRUD APIs for task resources
   - Validation, logging, and health checks

3. Data tier
   - PostgreSQL
   - Users and tasks tables
   - Data accessed through connection pooling

## Deployment model

- Local: Docker Compose
- Kubernetes: base manifests and overlays for AWS, Azure, GCP
- Helm: chart for templated deployment
- Terraform: cluster, networking, and managed database provisioning

## Security

- TLS termination at ingress/load balancer
- Secrets in K8s or cloud secret managers
- JWT tokens for API auth
- Non-root runtime containers
- IAM roles and least privilege
