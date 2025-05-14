FROM node:20.18.3-alpine

WORKDIR /app

# Ya no necesitamos las dependencias de compilación
RUN apk add --no-cache python3 # Solo si otras dependencias lo requieren

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]