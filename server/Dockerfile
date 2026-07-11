# STAGE 1: Build file JAR
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copy file pom.xml và tải thư viện trước
COPY pom.xml .
RUN mvn dependency:go-offline
# Copy toàn bộ source code và build (Bỏ qua test để build nhanh hơn)
COPY src ./src
RUN mvn clean package -DskipTests

# STAGE 2: Chạy ứng dụng
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
# Lấy file JAR đã build từ STAGE 1 sang STAGE 2
COPY --from=build /app/target/*.jar app.jar
# Mở port 8080
EXPOSE 8080
# Lệnh khởi chạy Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]