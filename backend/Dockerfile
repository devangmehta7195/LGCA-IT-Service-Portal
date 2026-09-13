# Use official Node.js LTS image
FROM node:24-alpine

# Set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY server.js ./

# Application listens on port 5000
EXPOSE 5000

# Start the backend API
CMD ["node", "server.js"]