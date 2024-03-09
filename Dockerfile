FROM node:16-slim AS deps

WORKDIR /app

RUN apt-get update && apt-get install -y git build-essential python3

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y git build-essential python3

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=deps /app/dist ./dist

ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA

CMD ["node", "--trace-warnings", "--enable-source-maps", "dist/src/index.js"]
