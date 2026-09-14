# Database Layer

This directory contains PostgreSQL initialization scripts used by local Docker Compose and cloud-managed database provisioning.

## Local database

The Compose stack uses the PostgreSQL image and executes the SQL files in `database/init` at startup.

## Cloud deployment

For AWS, Azure, and GCP, managed PostgreSQL is provisioned via Terraform and the application uses environment variables for host, port, user, password, and database name.

## Important

- Do not store production credentials in source control.
- Use `.env` locally, Kubernetes Secrets in cluster, and cloud secret managers in production.
