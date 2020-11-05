FROM node:15.0.1-buster-slim

WORKDIR /app
RUN npm install -g ts-node
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install
COPY ./tsconfig.json ./tsconfig.json
COPY ./src ./src
RUN npm run build
RUN npm link .
