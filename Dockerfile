FROM node:25-alpine AS build
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

ARG TARGET_ENVIRONMENTS

RUN mkdir -p /home/node/app/node_modules \
    && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

# Exclude the devDependencies of your project
RUN npm ci

COPY . .
# Here you export the build secrets so you can use them in your application. It is important to run "npm run build" in the same run command 
RUN npm run build:${TARGET_ENVIRONMENTS}

FROM node:25-alpine AS deployment

RUN deluser --remove-home node \
    && addgroup -S node -g 1001 \
    && adduser -S -G node -u 1001 node

WORKDIR /home/node/app

COPY deployment .
RUN npm install

COPY --from=build /home/node/app/dist ./dist
RUN chown -R node:node /home/node/app/*
RUN chmod -R 755 /home/node/app/*

USER 1001
EXPOSE 3000

CMD ["node","app.js"]