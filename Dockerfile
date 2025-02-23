# Usa una imagen de Node.js
FROM node:18

# Crea una carpeta de trabajo en el contenedor
WORKDIR /app

# Copia los archivos del bot al contenedor
COPY package.json ./
RUN npm install --legacy-peer-deps

# Copia el código del bot después de instalar las dependencias
COPY bot.js ./

# Comando para ejecutar el bot
CMD ["node", "bot.js"]

