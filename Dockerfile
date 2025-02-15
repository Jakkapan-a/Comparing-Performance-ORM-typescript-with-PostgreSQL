FROM node:22.14.0-alpine3.20

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

CMD ["tail", "-f", "/dev/null"]