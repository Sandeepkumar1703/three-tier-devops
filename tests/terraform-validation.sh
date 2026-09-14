#!/usr/bin/env bash
set -e

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is not installed" >&2
  exit 1
fi

for dir in terraform/aws terraform/azure terraform/gcp; do
  echo "Validating $dir"
  (cd "$dir" && terraform init -backend=false && terraform fmt -check -recursive && terraform validate)
done
