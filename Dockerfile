# Rasmiy Node.js image'ni bazaviy qilib olamiz
FROM node:20-alpine

# App uchun ishchi katalog yaratamiz
WORKDIR /app

# package.json va package-lock.json fayllarni konteynerga ko‘chiramiz
COPY package*.json ./

# Node modullarni o‘rnatamiz
RUN npm install

# Barcha project fayllarni ko‘chiramiz
COPY . .

# .env faylni (agar kerak bo‘lsa) alohida ko‘chirsang ham bo‘ladi
# COPY .env .env

# App ishlaydigan portni ochamiz
EXPOSE 3000

# Appni ishga tushuramiz (production bo‘lsa 'npm run start')
CMD ["npm", "run", "dev"]
