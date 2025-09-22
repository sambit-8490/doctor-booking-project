# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies (leverage Docker layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 5000

# Start the server
CMD ["node", "index.js"]
