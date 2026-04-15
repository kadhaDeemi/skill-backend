#!/usr/bin/env bash
set -o errexit
export CMAKE_BUILD_PARALLEL_LEVEL=1
pip install --no-cache-dir -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate