#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

IMAGE_NAME="ecommerce-store-web"
CONTAINER_NAME="ecommerce-store-container"

echo "🛑 Stopping and removing old container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

echo "🔨 Building fresh Docker image..."
# --no-cache ensures it pulls fresh packages if your package.json changed
docker build --no-cache -t $IMAGE_NAME .

echo "✅ Build Success!"

# echo "🚀 Starting the new container on port 8080..."
# docker run -d -p 8080:80 --name $CONTAINER_NAME $IMAGE_NAME

# echo "✅ Success! App is running at http://localhost:8080"