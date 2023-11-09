FROM node:alpine

WORKDIR /app

# better-sqlite3 will error out without these dependencies
RUN apk update ; apk upgrade ; apk add --no-cache \
  autoconf \
  build-base \
  coreutils \
  libtool \
  pkgconf \
  python3-dev

COPY package.json .

RUN npm install --omit=dev

COPY install .
COPY build .

CMD ["node", "build/index.js"]