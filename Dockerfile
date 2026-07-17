# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors and lockfile for deterministic dependency installation
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Serve the production bundle using Nginx on port 8080
FROM nginx:alpine

# Copy the production build output to the default Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite the default Nginx configuration with our custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document the port the container listens on at runtime
EXPOSE 8080

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
