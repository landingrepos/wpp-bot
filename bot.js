require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const app = express();

const OWNER = process.env.BOT_OWNER; // Carga el número desde la variable de entorno

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

client.on("qr", qr => {
    lastQR = qr;
    console.log("🚀 Escanea este QR con tu WhatsApp:");
    qrcode.generate(qr, { small: false });
});

// Servir el QR como imagen en una página web
app.get("/qr", (req, res) => {
    if (lastQR) {
        res.send(`
            <html>
            <head><title>QR Code</title></head>
            <body>
                <h2>Escanea este código QR con WhatsApp</h2>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(lastQR)}" />
            </body>
            </html>
        `);
    } else {
        res.send("QR no disponible. Espera un momento...");
    }
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`🌍 QR disponible en http://localhost:${PORT}/qr`));

client.on("ready", async () => {
    console.log("✅ Bot de WhatsApp conectado y listo.");

    if (!OWNER) {
        console.error("❌ No se encontró la variable de entorno BOT_OWNER. Asegúrate de configurarla.");
        return;
    }

    const message = "👋 ¡Hola! Soy tu bot de pruebas en Railway. Ya estoy conectado.";

    try {
        const chat = await client.getChatById(OWNER);
        await chat.sendMessage(message);
        console.log("✅ Mensaje de prueba enviado a tu número.");
    } catch (error) {
        console.error("❌ Error enviando mensaje:", error);
    }
});

client.on("message", async msg => {
    if (msg.from !== OWNER) return; // Ignorar mensajes que no sean tuyos

    console.log(`📩 Nuevo mensaje de ${msg.from}: ${msg.body}`);
    
    if (msg.body.toLowerCase() === "hola") {
        msg.reply("👋 ¡Hola! Soy un bot de pruebas en Railway.");
    }
});

client.initialize();
