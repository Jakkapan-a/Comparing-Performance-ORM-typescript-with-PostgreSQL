
# FROM node:22.14.0-slim
FROM node:22.14-alpine3.21

WORKDIR /app

# RUN apt-get update -y && \
#     apt-get install -y openssl libssl-dev && \
#     rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --save-dev --legacy-peer-deps
RUN npm install -g prisma --unsafe-perm

COPY . .

RUN npx prisma generate

CMD ["tail", "-f", "/dev/null"]
