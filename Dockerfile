FROM node:16-slim
WORKDIR /
COPY . .
RUN npm i
RUN npm run build
CMD ["node", "--trace-warnings", "--enable-source-maps", "dist/src/index.js"]
