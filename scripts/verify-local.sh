#!/usr/bin/env bash
set -e

echo "Checking frontend build..."
cd frontend && npm run build >/dev/null

echo "Checking backend tests..."
cd ../backend && NODE_ENV=test USE_PG_MEM=true npx jest --runInBand >/dev/null

echo "Verification passed."
