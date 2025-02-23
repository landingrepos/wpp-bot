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
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true
    }
});

// 📌 Evento cuando se genera el QR
client.on("qr", qr => {
    lastQR = qr;
    console.log("🚀 Escanea este QR con tu WhatsApp:");
    qrcode.generate(qr, { small: false });
});

// 🔥 Servir el QR en una página web
app.get("/qr", (req, res) => {
    if (!lastQR) {
        return res.send("<h2>QR no disponible. Espera un momento...</h2>");
    }

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

// 📌 Iniciar el servidor en Railway
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.send("✅ Servidor Express corriendo correctamente.");
});

app.listen(PORT, () => {
    console.log(`✅ Servidor Express corriendo en: http://localhost:${PORT}/`);
}).on("error", (err) => {
    console.error("❌ Error al iniciar Express:", err);
});

// 📌 Evento cuando el bot se conecta
client.on("ready", async () => {
    console.log("✅ Bot de WhatsApp conectado y listo.");

    const chatId = OWNER; 
    const message = "✅ El bot está en línea. Responde a este mensaje para probar.";

    try {
        const chat = await client.getChatById(chatId);
        await chat.sendMessage(message);
        console.log("✅ Mensaje de prueba enviado.");
    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
    }
});


// 📩 Evento cuando el bot recibe un mensaje y siempre responde con "Mensaje recibido"
client.on("message", async msg => {
    if (msg.from === "status@broadcast") return; // ❌ Ignorar mensajes de estados de WhatsApp
    if (msg.from !== OWNER) return; // ❌ Ignorar mensajes que no sean de tu número

    console.log("📩 Nuevo mensaje recibido:");
    console.log(`🆔 Remitente: ${msg.from}`);
    console.log(`💬 Mensaje: ${msg.body}`);
    console.log(`👥 Tipo de chat: ${msg.isGroupMsg ? "Grupo" : "Privado"}`);

    try {
        const chat = await msg.getChat();
        await chat.sendMessage("📩 Mensaje recibido.");
        console.log("✅ Respuesta enviada.");
    } catch (error) {
        console.error("❌ Error al responder:", error);
    }
});


// Inicializar el bot
client.initialize();
