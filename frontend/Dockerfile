FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Para el modo desarrollo, usaremos "npm run dev" configurado por docker-compose en Next.js, pero para producción se recomienda hacer build
EXPOSE 3000

CMD ["npm", "run", "dev"]
