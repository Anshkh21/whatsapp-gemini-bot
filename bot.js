require("dotenv").config();
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const processedMessagesFile = "./processedMessages.json";
let processedMessages = new Set();
const pendingMessages = new Set();
const conversationHistory = new Map();

// Load processed messages from file
if (fs.existsSync(processedMessagesFile)) {
    const savedMessages = JSON.parse(fs.readFileSync(processedMessagesFile, "utf-8"));
    processedMessages = new Set(savedMessages);
}

// Save processed messages periodically
function saveProcessedMessages() {
    fs.writeFileSync(processedMessagesFile, JSON.stringify([...processedMessages]), "utf-8");
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const sock = makeWASocket({ 
        auth: state,
        printQRInTerminal: true 
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", (update) => {
        const { connection } = update;
        if (connection === "close") {
            console.log("Connection closed, reconnecting...");
            connectToWhatsApp();
        } else if (connection === "open") {
            console.log("✅ Bot connected to WhatsApp successfully!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        if (!messages[0].message) return;
        const msg = messages[0];
        const sender = msg.key.remoteJid;
        const msgId = msg.key.id;
        const isFromMe = msg.key.fromMe;
        
        if (isFromMe) return;

        let text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";

        if (typeof text !== "string") {
            text = JSON.stringify(text);
        }

        const messageTimestamp = msg.messageTimestamp * 1000;
        const now = Date.now();
        if (now - messageTimestamp > 30000) return;

        if (processedMessages.has(msgId) || pendingMessages.has(msgId)) return;
        pendingMessages.add(msgId);
        
        console.log(`Message from ${sender}: ${text}`);

        if (!conversationHistory.has(sender)) {
            conversationHistory.set(sender, []);
        }
        
        const userHistory = conversationHistory.get(sender);
        if (userHistory.length > 10) {
            userHistory.shift();
        }
        userHistory.push(text);
        
        try {
            const history = userHistory.join("\n");
            const reply = await getAIResponse(history);
            if (reply) {
                await sock.sendMessage(sender, { text: makeCasual(reply) });
                userHistory.push(`Bot: ${reply}`);
            }
        } catch (error) {
            console.error("Error sending message: ", error.message);
        }

        processedMessages.add(msgId);
        pendingMessages.delete(msgId);
        saveProcessedMessages();
    });
}

async function getAIResponse(prompt) {
    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response?.text() || "I couldn't generate a response.";
        responseText = responseText.replace(/I am a large language model, trained by Google\./gi, "");
        responseText = responseText.replace(/I have access to vast amounts of information/gi, "");
        return responseText.trim();
    } catch (error) {
        console.error("Error with Gemini API: ", error.response?.data || error.message);
        return "I'm having trouble responding right now.";
    }
}

function makeCasual(text) {
    return text.replace(/\b(Hello|Hi|Greetings)\b/gi, "Hey")
               .replace(/\b(How can I assist you\?)\b/gi, "What’s up?")
               .replace(/\b(I am here to help you)\b/gi, "I got you!");
}

connectToWhatsApp();
