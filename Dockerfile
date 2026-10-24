FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:stable-alpine AS runtime

RUN apk upgrade --no-cache libexpat

ENV BFF_URL=http://bff:8080
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist/ecommerce-store-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
