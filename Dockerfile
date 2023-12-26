# Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Install build tools and dependencies
# Note that we're not using --only=production here because we may need devDependencies for building
COPY package*.json ./
RUN npm install

# Copy the application source code
COPY . .

# Build the application
RUN npm run build

# Run stage
FROM node:18-alpine
WORKDIR /usr/src/app

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Inform Docker that the container listens on the specified network ports at runtime.
EXPOSE 3000

# Define the command to run the app
CMD ["node", "dist/src/main"]