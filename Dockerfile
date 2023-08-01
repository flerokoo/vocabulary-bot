FROM node:alpine

WORKDIR /app

COPY package.json .

RUN npm install --omit=dev

COPY install ./install/
COPY build ./build/

CMD ["node", "build/index.js"]