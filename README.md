# WhatsApp Gemini Bot

## 📌 Introduction
This is an AI-powered WhatsApp chatbot that uses the **Gemini API** to generate responses and interacts with users seamlessly. The bot is built using:
- **Baileys Library** for WhatsApp Web automation
- **Google Generative AI (Gemini)** for AI responses
- **Node.js** for backend scripting

## 🚀 Features
- 📩 **Auto-replies to messages** with AI-generated responses
- 💬 **Maintains conversation history** for contextual responses
- 🔄 **Automatically reconnects** if disconnected
- 🎭 **Casual tone** for friendly interactions
- 🔒 **No self-replying issue** (avoids responding to its own messages)

## 🛠️ Installation
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-username/whatsapp-gemini-bot.git
cd whatsapp-gemini-bot
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Set Up Environment Variables**
Create a `.env` file and add your **Gemini API key**:
```sh
GEMINI_API_KEY=your_actual_api_key
```

### **4️⃣ Run the Bot**
```sh
node bot.js
```
Scan the QR code displayed in the terminal to connect your WhatsApp account.

## 📌 How to Keep It Running 24/7?
### **Using a Cloud Server (Recommended)**
You can deploy the bot on a cloud platform like **Railway.app, AWS, or VPS** so it stays online even when your laptop is off.

### **Auto-start on System Boot (Windows & Linux)**
- **Windows:** Use Task Scheduler to run `node bot.js` at startup.
- **Linux:** Use `pm2`:
  ```sh
  npm install -g pm2
  pm2 start bot.js --name whatsapp-bot
  pm2 save
  pm2 startup
  ```

### **Stopping the Bot**
Press `CTRL + C` in the terminal or use:
```sh
pm stop whatsapp-bot
```
(if running via pm2, use `pm2 stop whatsapp-bot`)

## 📜 License
This project is open-source and available for modification. Feel free to contribute!

---
