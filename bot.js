require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

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
    qrcode.generate(qr, { small: true });
    console.log("Escanea este QR con tu WhatsApp.");
});

client.on("ready", () => {
    console.log("✅ Bot de WhatsApp conectado y listo.");
});

client.on("message", async msg => {
    if (msg.body.toLowerCase() === "hola") {
        msg.reply("👋 ¡Hola! Soy un bot de pruebas en Railway.");
    }
});

client.initialize();
