require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

const app = express();
const OWNER = process.env.BOT_OWNER || "59891398664@c.us"; // Usa variable de entorno o valor por defecto

let lastQR = ""; // Almacena el último QR generado

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ],
        headless: true
    }
});

// Evento cuando se genera el QR
client.on("qr", qr => {
    lastQR = qr;
    console.log("🚀 Escanea este QR con tu WhatsApp:");
    qrcode.generate(qr, { small: false });
});

app.get("/", (req, res) => {
    res.send("✅ Servidor Express corriendo correctamente.");
});


// 🔥 Servir el QR en una página web
app.get("/qr", (req, res) => {
    if (!lastQR) {
        return res.send("<h2>QR no disponible. Espera un momento...</h2>");
    }

    // Opción de depuración: mostrar el QR en texto
    console.log("✅ QR Generado:", lastQR);

    // Generar código QR con API externa
    const qrImageURL = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(lastQR)}`;

    res.send(`
        <html>
        <head>
            <title>QR Code</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                img { margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2>Escanea este código QR con WhatsApp</h2>
            <img src="${qrImageURL}" />
            <p>Si la imagen no carga, intenta copiar este código y generarlo manualmente:</p>
            <code>${lastQR}</code>
        </body>
        </html>
    `);
});

// Iniciar el servidor en Railway
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en: http://localhost:${PORT}/`);
}).on("error", (err) => {
    console.error("❌ Error al iniciar Express:", err);
});


// Evento cuando el bot se conecta
client.on("ready", async () => {
    console.log("✅ Bot de WhatsApp conectado y listo.");

    if (!OWNER) {
        console.error("❌ No se encontró la variable de entorno BOT_OWNER.");
        return;
    }

    const message = "👋 ¡Hola! Soy tu bot de pruebas en Railway. Ya estoy conectado.";

    try {
        const chat = await client.getChatById(OWNER);
        await chat.sendMessage(message);
        console.log("✅ Mensaje de prueba enviado.");
    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
    }
});

// Evento cuando el bot recibe un mensaje
client.on("message", async msg => {
    if (msg.from !== OWNER) return; // Ignorar mensajes que no sean tuyos

    console.log(`📩 Nuevo mensaje de ${msg.from}: ${msg.body}`);
    
    if (msg.body.toLowerCase() === "hola") {
        msg.reply("👋 ¡Hola! Soy un bot de pruebas en Railway.");
    }
});

// Inicializar el bot
client.initialize();
