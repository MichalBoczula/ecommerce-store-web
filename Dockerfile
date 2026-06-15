# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first to leverage Docker caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code (skipping everything in your .dockerignore)
COPY . .

# Run production build
RUN npm run build -- --configuration production

# --- Stage 2: Runtime ---
FROM nginx:1.27-alpine AS runtime

# Copy custom Nginx configuration (Vital for Angular routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=build /app/dist/ecommerce-store-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]