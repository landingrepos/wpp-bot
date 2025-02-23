require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const app = express();

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

app.listen(3000, () => console.log("🌍 Abre Railway en /qr para ver el código QR"));

client.on("ready", () => {
    console.log("✅ Bot de WhatsApp conectado y listo.");
});

client.on("message", async msg => {
    if (msg.body.toLowerCase() === "hola") {
        msg.reply("👋 ¡Hola! Soy un bot de pruebas en Railway.");
    }
});

client.initialize();
