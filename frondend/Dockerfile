# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
# Copy các file đã build từ stage trước vào thư mục web root của nginx
# Sử dụng multi-stage build để giảm kích thước image cuối cùng
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
#Chạy nginx ở foreground mode để container không tự tắt
CMD ["nginx", "-g", "daemon off;"]
