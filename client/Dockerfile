# STAGE 1: Build React App
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Chú ý: Nếu bạn dùng Vite thì để npm run build, nó sẽ tạo ra thư mục 'dist'
# Nếu bạn dùng Create React App (CRA), nó sẽ tạo thư mục 'build'. Ở đây tôi giả định là Vite ('dist')
RUN npm run build

# STAGE 2: Chạy bằng Nginx
FROM nginx:alpine
# Copy file tĩnh từ STAGE 1 sang thư mục html của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Ghi đè cấu hình Nginx để hỗ trợ React Router (Không bị lỗi 404 khi F5 trang)
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Mở port 80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]