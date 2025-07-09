#!/bin/bash

# Load environment variables from .env file
set -o allexport
source .env
set +o allexport

# Run docker-compose with the loaded environment
docker-compose "$@"