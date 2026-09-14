#!/usr/bin/env bash
set -e

cp -n .env.example .env || true
cp -n backend/.env.example backend/.env || true

echo "Local environment initialized."
echo "Run: docker compose up --build"
