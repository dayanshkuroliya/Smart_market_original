# ==========================================
# STAGE 1: Iska naam humne 'builder' rakha hai
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Nginx Server
# ==========================================
FROM nginx:alpine

# YAHAN DHAYAN DIJIYE: --from=builder hona chahiye (kyunki upar AS builder hai)
COPY --from=builder /app/dist /usr/share/nginx/html

# Apni custom nginx config copy karo
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]