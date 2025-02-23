# Usa una imagen de Node.js 18
FROM node:18

# Instalar dependencias del sistema para Puppeteer y Chromium
RUN apt-get update && apt-get install -y \
  libnss3 libatk1.0-0 libx11-xcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxss1 libxtst6 libdbus-glib-1-2 \
  libasound2 libatk-bridge2.0-0 libcups2 libdrm2 --no-install-recommends

# Crea una carpeta de trabajo en el contenedor
WORKDIR /app

# Copia los archivos necesarios al contenedor
COPY package.json ./

# Instala las dependencias de Node.js
RUN npm install --legacy-peer-deps

# Copia el código del bot después de instalar las dependencias
COPY bot.js ./

# Comando para ejecutar el bot
CMD ["node", "bot.js"]
