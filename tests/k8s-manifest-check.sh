#!/usr/bin/env bash
set -e

for f in kubernetes/base/*.yaml; do
  echo "Checking $f"
  python - <<'PY' "$f"
import sys, yaml
path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as fh:
    docs = list(yaml.safe_load_all(fh))
    for doc in docs:
        if doc is None:
            continue
        if 'kind' not in doc or 'metadata' not in doc:
            raise ValueError(f"Invalid manifest structure in {path}")
print('ok')
PY
done
